import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("footer information links resolve to sections on the information page", async () => {
  const [footer, infoPage, viteConfig] = await Promise.all([
    readFile(new URL("src/components/footer.html", projectRoot), "utf8"),
    readFile(new URL("src/info-page.js", projectRoot), "utf8"),
    readFile(new URL("vite.config.js", projectRoot), "utf8"),
  ]);
  const footerLinks = [...footer.matchAll(/href="\/info\.html#([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(footerLinks, ["about", "help", "terms", "privacy"]);
  for (const section of footerLinks) {
    assert.match(infoPage, new RegExp(`id="${section}"`));
  }
  assert.match(viteConfig, /info: fileURLToPath\(new URL\("\.\/info\.html"/);
  assert.doesNotMatch(footer, /href="\{\{aboutHref\}\}"/);
});

test("footer does not present unconfigured social profiles as links", async () => {
  const footer = await readFile(
    new URL("src/components/footer.html", projectRoot),
    "utf8",
  );

  assert.match(footer, /Kênh mạng xã hội sẽ được cập nhật/);
  assert.doesNotMatch(footer, /class="socials"/);
});

test("registration terms link to the real terms section", async () => {
  const [registration, infoPage] = await Promise.all([
    readFile(new URL("register.html", projectRoot), "utf8"),
    readFile(new URL("src/info-page.js", projectRoot), "utf8"),
  ]);

  assert.match(registration, /href="\/info\.html#terms"/);
  assert.match(infoPage, /id="terms"/);
  assert.match(infoPage, /chưa hỗ trợ đặt lại mật khẩu qua email/i);
});

test("newsletter consent and privacy text disclose storage and delivery limits", async () => {
  const [homeScript, infoPage] = await Promise.all([
    readFile(new URL("src/main.js", projectRoot), "utf8"),
    readFile(new URL("src/info-page.js", projectRoot), "utf8"),
  ]);

  assert.match(homeScript, /name="consent" required/);
  assert.match(homeScript, /consent: form\.elements\.consent\.checked/);
  assert.match(homeScript, /\/api\/newsletter\/unsubscribe/);
  assert.match(infoPage, /Email chỉ được lưu vào danh sách quan tâm nhận tin/);
  assert.match(infoPage, /hủy đăng ký bằng cách nhập lại email đã dùng/);
});

test("release schedule is linked publicly and managed through the shared catalog", async () => {
  const [header, calendarPage, adminPage, viteConfig, infoPage] =
    await Promise.all([
      readFile(new URL("src/components/header.html", projectRoot), "utf8"),
      readFile(new URL("src/schedule-page.js", projectRoot), "utf8"),
      readFile(new URL("src/data/schedule-admin.js", projectRoot), "utf8"),
      readFile(new URL("vite.config.js", projectRoot), "utf8"),
      readFile(new URL("src/info-page.js", projectRoot), "utf8"),
    ]);

  assert.match(header, /href="\/schedule\.html"/);
  assert.match(calendarPage, /getReleaseSchedule/);
  assert.match(calendarPage, /event\.type === "episode"/);
  assert.match(calendarPage, /scheduleWeek/);
  assert.match(calendarPage, /schedule-week-day/);
  assert.match(calendarPage, /scheduleWeekLabel/);
  assert.match(calendarPage, /GMT\+7/);
  assert.match(calendarPage, /Tập \$\{String\(event\.episodeNumber\)/);
  assert.match(adminPage, /saveSharedSchedule/);
  assert.match(adminPage, /list="eventMovieOptions"/);
  assert.match(adminPage, /movie\.title === document\.querySelector\("#eventMovie"\)\.value\.trim\(\)/);
  assert.match(viteConfig, /adminSchedule: fileURLToPath/);
  assert.match(infoPage, /Lịch do quản trị viên cập nhật/);
});
