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
  const tmdbPort = await getAvailablePort();
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
          Released: "15 Mar 2024",
          Runtime: "120 min",
          imdbID: "tt1234567",
          imdbRating: "7.8",
          Country: "United States, Canada",
          Language: "English, French",
          Rated: "PG-13",
          Genre: "Action, Drama",
          Plot: "A film synopsis.",
          Poster: "https://images.example.com/poster.jpg",
          Director: "Film Director",
          Actors: "Actor One, Actor Two",
          Writer: "Screenwriter",
          Production: "Film Studio",
          Awards: "Won 2 Oscars",
          BoxOffice: "$711,844,358",
          Website: "https://example.com/film",
        }),
      );
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ Response: "False", Error: "Movie not found!" }));
    }
  });
  await new Promise((resolve) => omdbServer.listen(omdbPort, "127.0.0.1", resolve));
  const tmdbServer = createHttpServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    response.writeHead(200, { "Content-Type": "application/json" });
    if (request.headers.authorization !== "Bearer test-header.payload.signature") {
      response.end(JSON.stringify({ error: "Invalid API key" }));
    } else if (url.pathname.endsWith("/search/movie")) {
      response.end(
        JSON.stringify({
          results: [{ id: 42, title: "Lookup Film", release_date: "2024-03-15" }],
        }),
      );
    } else if (url.pathname.endsWith("/similar")) {
      response.end(
        JSON.stringify({
          results: [
            {
              id: 43,
              title: "Related Film",
              release_date: "2023-06-12",
              overview: "A related film synopsis.",
              poster_path: "/related-poster.jpg",
            },
          ],
        }),
      );
    } else if (url.pathname.endsWith("/movie/42")) {
      response.end(
        JSON.stringify({
          title: "Lookup Film",
          release_date: "2024-03-15",
          runtime: 124,
          production_countries: [{ name: "United States" }],
          spoken_languages: [{ english_name: "English" }],
          production_companies: [{ name: "TMDb Studio" }],
          homepage: "https://tmdb.example.com/film",
          genres: [{ name: "Action" }, { name: "Science Fiction" }],
          overview: "TMDb film synopsis.",
          poster_path: "/lookup-poster.jpg",
          backdrop_path: "/lookup-backdrop.jpg",
          credits: {
            cast: [{ name: "TMDb Actor" }],
            crew: [
              { name: "TMDb Director", job: "Director" },
              { name: "TMDb Writer", job: "Screenplay" },
              { name: "TMDb Producer", job: "Producer" },
              { name: "TMDb Cinematographer", job: "Director of Photography" },
              { name: "TMDb Composer", job: "Original Music Composer" },
            ],
          },
          videos: {
            results: [
              { site: "YouTube", type: "Trailer", official: true, key: "abcdefghijk" },
            ],
          },
          release_dates: {
            results: [
              {
                iso_3166_1: "US",
                release_dates: [{ certification: "PG-13" }],
              },
            ],
          },
        }),
      );
    } else {
      response.end(JSON.stringify({ results: [] }));
    }
  });
  await new Promise((resolve) => tmdbServer.listen(tmdbPort, "127.0.0.1", resolve));
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
      TMDB_API_KEY: "test-header.payload.signature",
      TMDB_API_URL: `http://127.0.0.1:${tmdbPort}/3/`,
      REVIEWS_STORE_PATH: path.join(directory, "reviews.json"),
      AUTH_USERS_STORE_PATH: path.join(directory, "users.json"),
      MOVIES_STORE_PATH: path.join(directory, "movies.json"),
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
    await new Promise((resolve, reject) =>
      tmdbServer.close((error) => (error ? reject(error) : resolve())),
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

  const invalidNewsletterSignup = await fetch(
    `${baseUrl}/newsletter/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "reader@example.com",
        consent: false,
      }),
    },
  );
  assert.equal(invalidNewsletterSignup.status, 400);

  const invalidNewsletterEmail = await fetch(
    `${baseUrl}/newsletter/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        consent: true,
      }),
    },
  );
  assert.equal(invalidNewsletterEmail.status, 400);

  const newsletterSignup = await fetch(`${baseUrl}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: " Reader@Example.com ",
      consent: true,
    }),
  });
  assert.equal(newsletterSignup.status, 202);
  const signupResult = await newsletterSignup.json();
  assert.equal(signupResult.ok, true);
  assert.match(signupResult.message, /chưa gửi email bản tin tự động/);
  assert.equal(signupResult.message.includes("reader@example.com"), false);

  const duplicateNewsletterSignups = await Promise.all(
    Array.from({ length: 2 }, () =>
      fetch(`${baseUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "reader@example.com",
          consent: true,
        }),
      }),
    ),
  );
  assert.deepEqual(
    duplicateNewsletterSignups.map((response) => response.status),
    [202, 202],
  );
  const savedNewsletter = JSON.parse(
    await readFile(path.join(directory, "newsletter.json"), "utf8"),
  );
  assert.equal(savedNewsletter.length, 1);
  assert.equal(savedNewsletter[0].email, "reader@example.com");
  assert.ok(savedNewsletter[0].subscribedAt);

  const invalidNewsletterUnsubscribe = await fetch(
    `${baseUrl}/newsletter/unsubscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    },
  );
  assert.equal(invalidNewsletterUnsubscribe.status, 400);

  const newsletterUnsubscribe = await fetch(
    `${baseUrl}/newsletter/unsubscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: " Reader@Example.com " }),
    },
  );
  assert.equal(newsletterUnsubscribe.status, 200);
  const unsubscribeResult = await newsletterUnsubscribe.json();
  assert.equal(unsubscribeResult.ok, true);
  assert.doesNotMatch(unsubscribeResult.message, /reader@example\.com/i);
  assert.equal(
    JSON.parse(
      await readFile(path.join(directory, "newsletter.json"), "utf8"),
    ).length,
    0,
  );

  const absentNewsletterUnsubscribe = await fetch(
    `${baseUrl}/newsletter/unsubscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "absent@example.com" }),
    },
  );
  assert.equal(absentNewsletterUnsubscribe.status, 200);
  assert.equal(
    (await absentNewsletterUnsubscribe.json()).message,
    unsubscribeResult.message,
  );

  const registrationResponse = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Viewer Account",
      email: "Viewer@Example.com",
      password: "test-user-password",
    }),
  });
  assert.equal(registrationResponse.status, 201);
  const registration = await registrationResponse.json();
  assert.equal(registration.user.email, "viewer@example.com");
  assert.equal("password" in registration.user, false);

  const duplicateRegistration = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Account",
      email: "viewer@example.com",
      password: "test-user-password",
    }),
  });
  assert.equal(duplicateRegistration.status, 409);

  const reservedEmail = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Admin Impersonator",
      email: "admin@test.local",
      password: "test-user-password",
    }),
  });
  assert.equal(reservedEmail.status, 409);

  const invalidUserLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "wrong-password",
    }),
  });
  assert.equal(invalidUserLogin.status, 401);

  const userLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "test-user-password",
      remember: true,
    }),
  });
  assert.equal(userLogin.status, 200);
  const userSession = await userLogin.json();
  assert.equal(userSession.user.role, "user");
  assert.ok(userSession.token);
  assert.ok(userSession.expiresAt > Date.now() + 29 * 24 * 60 * 60 * 1000);

  const savedUsers = JSON.parse(
    await readFile(path.join(directory, "users.json"), "utf8"),
  );
  assert.equal(savedUsers.length, 1);
  assert.equal("password" in savedUsers[0], false);
  assert.notEqual(savedUsers[0].passwordHash, "test-user-password");
  assert.equal(savedUsers[0].passwordHash.length, 128);

  const userLogout = await fetch(`${baseUrl}/auth/session`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userSession.token}` },
  });
  assert.equal(userLogout.status, 200);

  const temporaryUserLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "test-user-password",
    }),
  });
  assert.equal(temporaryUserLogin.status, 200);
  const temporarySession = await temporaryUserLogin.json();
  assert.ok(temporarySession.expiresAt > Date.now() + 11 * 60 * 60 * 1000);
  assert.ok(temporarySession.expiresAt < Date.now() + 13 * 60 * 60 * 1000);

  const missingPasswordSession = await fetch(`${baseUrl}/auth/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPassword: "test-user-password",
      newPassword: "replacement-password",
    }),
  });
  assert.equal(missingPasswordSession.status, 401);

  const invalidNewPassword = await fetch(`${baseUrl}/auth/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Be" + "arer " + temporarySession.token,
    },
    body: JSON.stringify({
      currentPassword: "test-user-password",
      newPassword: "short",
    }),
  });
  assert.equal(invalidNewPassword.status, 400);

  const incorrectCurrentPassword = await fetch(`${baseUrl}/auth/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Be" + "arer " + temporarySession.token,
    },
    body: JSON.stringify({
      currentPassword: "incorrect-password",
      newPassword: "replacement-password",
    }),
  });
  assert.equal(incorrectCurrentPassword.status, 401);

  const secondUserLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "test-user-password",
    }),
  });
  assert.equal(secondUserLogin.status, 200);
  const secondUserSession = await secondUserLogin.json();

  const passwordChange = await fetch(`${baseUrl}/auth/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Be" + "arer " + temporarySession.token,
    },
    body: JSON.stringify({
      currentPassword: "test-user-password",
      newPassword: "replacement-password",
    }),
  });
  assert.equal(passwordChange.status, 200);
  assert.equal((await passwordChange.json()).ok, true);

  for (const token of [temporarySession.token, secondUserSession.token]) {
    const revokedSession = await fetch(`${baseUrl}/auth/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Be" + "arer " + token,
      },
      body: JSON.stringify({
        currentPassword: "test-user-password",
        newPassword: "another-password",
      }),
    });
    assert.equal(revokedSession.status, 401);
  }

  const oldPasswordLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "test-user-password",
    }),
  });
  assert.equal(oldPasswordLogin.status, 401);

  const newPasswordLogin = await fetch(`${baseUrl}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "viewer@example.com",
      password: "replacement-password",
    }),
  });
  assert.equal(newPasswordLogin.status, 200);
  const updatedUserSession = await newPasswordLogin.json();

  await fetch(`${baseUrl}/auth/session`, {
    method: "DELETE",
    headers: { Authorization: "Be" + "arer " + updatedUserSession.token },
  });
  await fetch(`${baseUrl}/auth/session`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${temporarySession.token}` },
  });

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
  const movieSearch = await fetch(
    `${baseUrl}/admin/movie-search?query=Lookup%20Film`,
    { headers: adminHeaders },
  );
  assert.equal(movieSearch.status, 200);
  assert.deepEqual(await movieSearch.json(), {
    movies: [
      {
        id: 42,
        title: "Lookup Film",
        year: "2024",
        overview: "",
        poster: "",
      },
    ],
  });

  const movieCatalog = [
    {
      id: "api-movie-1",
      title: "Trailer Test Film",
      year: "2026",
      trailerUrl: "https://www.youtube.com/watch?v=abcdefghijk",
    },
  ];
  const unauthorizedCatalogSave = await fetch(`${baseUrl}/admin/movies`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ movies: movieCatalog }),
  });
  assert.equal(unauthorizedCatalogSave.status, 401);

  const catalogSave = await fetch(`${baseUrl}/admin/movies`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ movies: movieCatalog }),
  });
  assert.equal(catalogSave.status, 200);
  const catalogResponse = await fetch(`${baseUrl}/movies`);
  assert.equal(catalogResponse.status, 200);
  assert.deepEqual((await catalogResponse.json()).movies, movieCatalog);
  assert.deepEqual(
    JSON.parse(await readFile(path.join(directory, "movies.json"), "utf8")),
    movieCatalog,
  );

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
  const movieDetails = await fetch(
    `${baseUrl}/admin/movie-details?title=Lookup%20Film`,
    { headers: adminHeaders },
  );
  assert.equal(movieDetails.status, 200);
  assert.deepEqual(await movieDetails.json(), {
    title: "Lookup Film",
    year: "2024",
    releaseDate: "2024-03-15",
    rating: 7.8,
    imdbId: "tt1234567",
    country: "United States",
    runtime: "124 min",
    language: "English",
    ageRating: "PG-13",
    genre: "Action, Science Fiction",
    description: "TMDb film synopsis.",
    poster: "https://image.tmdb.org/t/p/original/lookup-poster.jpg",
    director: "TMDb Director",
    cast: "TMDb Actor",
    writers: "TMDb Writer",
    studio: "TMDb Studio",
    producers: "TMDb Producer",
    cinematographers: "TMDb Cinematographer",
    composers: "TMDb Composer",
    backdrop: "https://image.tmdb.org/t/p/original/lookup-backdrop.jpg",
    trailer: "https://www.youtube.com/watch?v=abcdefghijk",
    awards: "Won 2 Oscars",
    boxOffice: "$711,844,358",
    website: "https://tmdb.example.com/film",
    source: "OMDb + TMDb",
    similarMovies: [
      {
        title: "Related Film",
        year: "2023",
        overview: "A related film synopsis.",
        poster: "https://image.tmdb.org/t/p/original/related-poster.jpg",
      },
    ],
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
