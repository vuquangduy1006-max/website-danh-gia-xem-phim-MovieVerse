import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("renderAccountActions renders notification dropdown frame instead of page link", async () => {
  const indexJs = await readFile(
    new URL("src/components/index.js", projectRoot),
    "utf8",
  );

  assert.match(indexJs, /class="notification-container"/);
  assert.match(indexJs, /id="notificationBellBtn"/);
  assert.match(indexJs, /id="notificationDropdown"/);
  assert.match(indexJs, /class="notification-heading">Thông báo<\/h3>/);
  assert.match(indexJs, /id="notificationMarkAllBtn">Đánh dấu đã đọc<\/button>/);
  assert.match(indexJs, /id="notificationDropdownList"/);
  assert.match(indexJs, /Bạn chưa có thông báo nào\./);
  assert.match(indexJs, /bindNotificationDropdown/);
});

test("style.css contains styles for notification dropdown frame", async () => {
  const css = await readFile(new URL("src/style.css", projectRoot), "utf8");

  assert.match(css, /\.notification-container/);
  assert.match(css, /\.notification-bell/);
  assert.match(css, /\.notification-dropdown/);
  assert.match(css, /\.notification-header/);
  assert.match(css, /\.notification-heading/);
  assert.match(css, /\.notification-mark-all/);
  assert.match(css, /\.notification-empty/);
});
