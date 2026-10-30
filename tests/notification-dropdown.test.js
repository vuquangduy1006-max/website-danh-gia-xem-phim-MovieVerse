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
  assert.doesNotMatch(indexJs, /notificationMarkAllBtn|Đánh dấu đã đọc/);
  assert.match(indexJs, /id="notificationDropdownList"/);
  assert.match(indexJs, /Bạn chưa có thông báo nào\./);
  assert.match(indexJs, /bindNotificationDropdown/);
  assert.match(indexJs, /if \(unreadCount > 0\)/);
  assert.match(indexJs, /fetch\("\/api\/notifications\/read", \{\s*method: "PATCH"/);
  assert.match(indexJs, /classList\.remove\("unread"\)/);
});

test("style.css contains styles for notification dropdown frame", async () => {
  const css = await readFile(new URL("src/style.css", projectRoot), "utf8");

  assert.match(css, /\.notification-container/);
  assert.match(css, /\.notification-bell/);
  assert.match(css, /\.notification-dropdown/);
  assert.match(css, /\.notification-header/);
  assert.match(css, /\.notification-heading/);
  assert.match(css, /\.notification-empty/);
  assert.match(css, /\.notification-dropdown\s*\{[^}]*max-height:\s*min\(490px,\s*calc\(100vh - 90px\)\)/s);
  assert.match(css, /\.notification-body\s*\{[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;/s);
});
