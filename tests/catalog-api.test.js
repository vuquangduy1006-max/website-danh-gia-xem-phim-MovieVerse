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
  assert.deepEqual(initialCatalog.schedule, []);
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

  const unauthorizedScheduleResponse = await fetch(
    `${baseUrl}/api/admin/schedule`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schedule: [],
        expectedUpdatedAt: initialCatalog.updatedAt,
      }),
    },
  );
  assert.equal(unauthorizedScheduleResponse.status, 403);

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

  const scheduleEvents = [
    {
      id: "schedule-film-test",
      movieId: "shared-catalog-test",
      type: "movie",
      date: "2099-12-01",
      time: "20:30",
      note: "Chiếu tại rạp",
    },
    {
      id: "schedule-episode-test",
      movieId: "shared-catalog-test",
      type: "episode",
      date: "2099-12-08",
      episodeNumber: 3,
    },
  ];
  const scheduleResponse = await fetch(`${baseUrl}/api/admin/schedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Be" + "arer " + token,
    },
    body: JSON.stringify({
      schedule: scheduleEvents,
      expectedUpdatedAt: updatedCatalog.updatedAt,
    }),
  });
  assert.equal(scheduleResponse.status, 200);
  const catalogWithSchedule = await scheduleResponse.json();
  assert.deepEqual(catalogWithSchedule.schedule, scheduleEvents);

  const publicSchedule = await fetch(`${baseUrl}/api/catalog`).then((response) =>
    response.json(),
  );
  assert.deepEqual(publicSchedule.schedule, scheduleEvents);

  const registrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Schedule Test",
      email: "schedule@test.local",
      password: "test-password",
    }),
  });
  assert.equal(registrationResponse.status, 201);

  const userLoginResponse = await fetch(`${baseUrl}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "schedule@test.local",
      password: "test-password",
    }),
  });
  assert.equal(userLoginResponse.status, 200);
  const userLogin = await userLoginResponse.json();
  const { token: userToken } = userLogin;
  assert.equal(userLogin.user.name, "Schedule Test");

  const noAvatarProfileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      name: "Movie Fan",
      bio: "Thích phim hay",
      avatar: "",
    }),
  });
  assert.equal(noAvatarProfileResponse.status, 200);

  const updatedProfileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      name: "Movie Fan",
      bio: "Thích phim hay",
      avatar: "data:image/png;base64,iVBORw0KGgo=",
    }),
  });
  assert.equal(updatedProfileResponse.status, 200);
  const updatedProfile = await updatedProfileResponse.json();
  assert.equal(updatedProfile.user.name, "Movie Fan");
  assert.equal(updatedProfile.user.bio, "Thích phim hay");
  assert.equal(
    updatedProfile.user.avatar,
    "data:image/png;base64,iVBORw0KGgo=",
  );

  const invalidProfileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name: "X", bio: "ok", avatar: "" }),
  });
  assert.equal(invalidProfileResponse.status, 400);

  const updatedLogin = await fetch(`${baseUrl}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "schedule@test.local",
      password: "test-password",
    }),
  }).then((response) => response.json());
  assert.equal(updatedLogin.user.name, "Movie Fan");
  assert.equal(updatedLogin.user.bio, "Thích phim hay");
  assert.equal(
    updatedLogin.user.avatar,
    "data:image/png;base64,iVBORw0KGgo=",
  );

  const notificationsResponse = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(notificationsResponse.status, 200);
  const notifications = await notificationsResponse.json();
  assert.deepEqual(
    notifications.notifications.map(({ type, movieTitle, read }) => ({
      type,
      movieTitle,
      read,
    })),
    [
      { type: "schedule", movieTitle: "Shared catalog test", read: false },
      { type: "schedule", movieTitle: "Shared catalog test", read: false },
    ],
  );
  assert.equal(notifications.notifications[0].eventType, "movie");
  assert.equal(notifications.notifications[1].eventType, "episode");

  const markNotificationsReadResponse = await fetch(
    `${baseUrl}/api/notifications/read`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );
  assert.equal(markNotificationsReadResponse.status, 200);
  const readNotifications = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${userToken}` },
  }).then((response) => response.json());
  assert.ok(readNotifications.notifications.every(({ read }) => read));

  const invalidScheduleResponse = await fetch(
    `${baseUrl}/api/admin/schedule`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Be" + "arer " + token,
      },
      body: JSON.stringify({
        schedule: [
          {
            id: "invalid-schedule-test",
            movieId: "shared-catalog-test",
            type: "movie",
            date: "2026-02-30",
          },
        ],
        expectedUpdatedAt: catalogWithSchedule.updatedAt,
      }),
    },
  );
  assert.equal(invalidScheduleResponse.status, 400);

  const staleScheduleResponse = await fetch(
    `${baseUrl}/api/admin/schedule`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Be" + "arer " + token,
      },
      body: JSON.stringify({
        schedule: [],
        expectedUpdatedAt: updatedCatalog.updatedAt,
      }),
    },
  );
  assert.equal(staleScheduleResponse.status, 409);

  const savedCatalog = JSON.parse(
    await readFile(path.join(directory, "catalog.json"), "utf8"),
  );
  assert.equal(savedCatalog.updatedAt, catalogWithSchedule.updatedAt);
  assert.deepEqual(savedCatalog.schedule, scheduleEvents);

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

  const removeScheduledMovieResponse = await fetch(
    `${baseUrl}/api/admin/catalog`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Be" + "arer " + token,
      },
      body: JSON.stringify({
        movies: initialCatalog.movies,
        genres: initialCatalog.genres,
        expectedUpdatedAt: catalogWithSchedule.updatedAt,
      }),
    },
  );
  assert.equal(removeScheduledMovieResponse.status, 200);
  assert.deepEqual(
    (await removeScheduledMovieResponse.json()).schedule,
    [],
  );
});
