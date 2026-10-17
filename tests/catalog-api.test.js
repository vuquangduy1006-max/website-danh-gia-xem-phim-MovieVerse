import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
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
      throw new Error(`Movie catalog API exited during startup: ${readErrors()}`);
    }
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Movie catalog API did not start: ${readErrors()}`);
}

test("movie catalog is shared, persisted, admin-only to update, and rejects stale edits", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "movieverse-catalog-"));
  const port = await getAvailablePort();
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(port),
      ADMIN_EMAIL: "admin@test.local",
      ADMIN_PASSWORD: "test-password",
      MOVIE_CATALOG_STORE_PATH: path.join(directory, "catalog.json"),
      REVIEWS_STORE_PATH: path.join(directory, "reviews.json"),
      AUTH_USERS_STORE_PATH: path.join(directory, "users.json"),
      NEWSLETTER_STORE_PATH: path.join(directory, "newsletter.json"),
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
    await rm(directory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(child, baseUrl, () => serverErrors);

  const initialResponse = await fetch(`${baseUrl}/api/catalog`);
  assert.equal(initialResponse.status, 200);
  const initialCatalog = await initialResponse.json();
  assert.ok(initialCatalog.movies.length > 0);
  assert.ok(initialCatalog.genres.includes("Hành động"));
  assert.equal(initialCatalog.updatedAt, null);

  const unauthorizedResponse = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      movies: initialCatalog.movies,
      genres: initialCatalog.genres,
      expectedUpdatedAt: initialCatalog.updatedAt,
    }),
  });
  assert.equal(unauthorizedResponse.status, 403);

  const loginResponse = await fetch(`${baseUrl}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@test.local",
      password: "test-password",
    }),
  });
  assert.equal(loginResponse.status, 200);
  const { token } = await loginResponse.json();

  const updatedMovies = [
    ...initialCatalog.movies,
    {
      id: "shared-catalog-test",
      title: "Shared catalog test",
      year: "2026",
      genre: "Thử nghiệm",
      rating: "8.0",
    },
  ];
  const updatedGenres = [...initialCatalog.genres, "Thử nghiệm"];
  const updateResponse = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movies: updatedMovies,
      genres: updatedGenres,
      expectedUpdatedAt: initialCatalog.updatedAt,
    }),
  });
  assert.equal(updateResponse.status, 200);
  const updatedCatalog = await updateResponse.json();
  assert.equal(typeof updatedCatalog.updatedAt, "string");

  const sharedCatalog = await fetch(`${baseUrl}/api/catalog`).then((response) =>
    response.json(),
  );
  assert.ok(
    sharedCatalog.movies.some((movie) => movie.id === "shared-catalog-test"),
  );
  assert.ok(sharedCatalog.genres.includes("Thử nghiệm"));

  const savedCatalog = JSON.parse(
    await readFile(path.join(directory, "catalog.json"), "utf8"),
  );
  assert.equal(savedCatalog.updatedAt, updatedCatalog.updatedAt);

  const staleResponse = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movies: updatedMovies,
      genres: updatedGenres,
      expectedUpdatedAt: initialCatalog.updatedAt,
    }),
  });
  assert.equal(staleResponse.status, 409);

  const invalidResponse = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movies: [{ id: "duplicate", title: "One" }, { id: "duplicate", title: "Two" }],
      genres: ["Test"],
      expectedUpdatedAt: updatedCatalog.updatedAt,
    }),
  });
  assert.equal(invalidResponse.status, 400);
});
