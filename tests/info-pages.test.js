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
