import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer as createHttpServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";

async function getAvailablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

async function waitForServer(child, url, readErrors) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Review API exited during startup: ${readErrors()}`);
    }
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Review API did not start: ${readErrors()}`);
}

test("review API shares replies, persists moderation and protects admin actions", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "movieverse-reviews-"));
  const port = await getAvailablePort();
  const omdbPort = await getAvailablePort();
  const omdbServer = createHttpServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.searchParams.get("t") === "Invalid Key Test") {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ Response: "False", Error: "Invalid API key!" }));
    } else if (url.searchParams.get("apikey") !== "test-omdb-key") {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ Response: "False", Error: "Invalid API key!" }));
    } else if (url.searchParams.get("t") === "Lookup Film") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          Response: "True",
          Title: "Lookup Film",
          Year: "2024",
          imdbID: "tt1234567",
          imdbRating: "7.8",
        }),
      );
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ Response: "False", Error: "Movie not found!" }));
    }
  });
  await new Promise((resolve) => omdbServer.listen(omdbPort, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(port),
      ADMIN_EMAIL: "admin@test.local",
      ADMIN_PASSWORD: "test-password",
      OMDB_API_KEY: "test-omdb-key",
      OMDB_API_URL: `http://127.0.0.1:${omdbPort}/`,
      REVIEWS_STORE_PATH: path.join(directory, "reviews.json"),
    },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let serverErrors = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    serverErrors += chunk;
  });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill();
      await Promise.race([
        once(child, "exit"),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
    await new Promise((resolve, reject) =>
      omdbServer.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
  });

  await waitForServer(child, baseUrl.replace(/\/api$/, ""), () => serverErrors);
  const seeded = await fetch(`${baseUrl}/reviews`).then((response) =>
    response.json(),
  );
  assert.equal(seeded.reviews.length, 3);

  const invalid = await fetch(`${baseUrl}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(null),
  });
  assert.equal(invalid.status, 400);

  const createdResponse = await fetch(`${baseUrl}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      movieTitle: "API Test Film",
      author: "Viewer One",
      rating: 4,
      comment: "Shared review content.",
    }),
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  const review = created.reviews.find(
    (item) => item.movieTitle === "API Test Film",
  );
  assert.ok(review);

  const userReply = await fetch(`${baseUrl}/reviews/${review.id}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author: "Viewer Two",
      role: "user",
      comment: "I agree with your review.",
    }),
  });
  assert.equal(userReply.status, 201);
  assert.equal(
    (await userReply.json()).reviews.find((item) => item.id === review.id)
      .replies.length,
    1,
  );

  const unauthorizedAdminReply = await fetch(
    `${baseUrl}/reviews/${review.id}/replies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: "Impersonator",
        role: "admin",
        comment: "This must be rejected.",
      }),
    },
  );
  assert.equal(unauthorizedAdminReply.status, 403);

  const invalidLogin = await fetch(`${baseUrl}/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@test.local",
      password: "wrong-password",
    }),
  });
  assert.equal(invalidLogin.status, 401);

  const loginResponse = await fetch(`${baseUrl}/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@test.local",
      password: "test-password",
    }),
  });
  assert.equal(loginResponse.status, 200);
  const { token } = await loginResponse.json();
  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const unauthorizedRating = await fetch(
    `${baseUrl}/admin/movie-rating?title=Lookup%20Film`,
  );
  assert.equal(unauthorizedRating.status, 403);
  const movieRating = await fetch(
    `${baseUrl}/admin/movie-rating?title=Lookup%20Film`,
    { headers: adminHeaders },
  );
  assert.equal(movieRating.status, 200);
  assert.deepEqual(await movieRating.json(), {
    rating: 7.8,
    title: "Lookup Film",
    year: "2024",
    imdbId: "tt1234567",
    source: "IMDb qua OMDb",
  });
  const missingRating = await fetch(
    `${baseUrl}/admin/movie-rating?title=Unknown%20Film`,
    { headers: adminHeaders },
  );
  assert.equal(missingRating.status, 404);
  const invalidProviderKey = await fetch(
    `${baseUrl}/admin/movie-rating?title=Invalid%20Key%20Test`,
    { headers: adminHeaders },
  );
  assert.equal(invalidProviderKey.status, 503);
  assert.match(
    (await invalidProviderKey.json()).error,
    /OMDb không chấp nhận API key/,
  );

  const adminReply = await fetch(`${baseUrl}/reviews/${review.id}/replies`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      author: "Wrong Display Name",
      role: "admin",
      comment: "Admin reply.",
    }),
  });
  assert.equal(adminReply.status, 201);
  const shared = (await adminReply.json()).reviews.find(
    (item) => item.id === review.id,
  );
  assert.equal(shared.replies[1].author, "MovieVerse Admin");
  assert.equal(shared.replies[1].role, "admin");

  const unauthorizedDelete = await fetch(`${baseUrl}/reviews/${review.id}`, {
    method: "DELETE",
  });
  assert.equal(unauthorizedDelete.status, 403);

  const hidden = await fetch(`${baseUrl}/reviews/${review.id}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ hidden: true }),
  });
  assert.equal(hidden.status, 200);
  const persisted = JSON.parse(
    await readFile(path.join(directory, "reviews.json"), "utf8"),
  );
  assert.equal(
    persisted.find((item) => item.id === review.id).hidden,
    true,
  );

  const deleted = await fetch(`${baseUrl}/reviews/${review.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert.equal(deleted.status, 200);
  assert.equal(
    (await deleted.json()).reviews.some((item) => item.id === review.id),
    false,
  );
});
