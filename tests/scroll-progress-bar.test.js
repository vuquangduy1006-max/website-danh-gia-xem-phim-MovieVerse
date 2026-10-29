import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("top scroll progress bar is rendered and styled correctly", async () => {
  const headerHtml = await readFile(new URL("src/components/header.html", projectRoot), "utf8");
  const componentsJs = await readFile(new URL("src/components/index.js", projectRoot), "utf8");
  const styleCss = await readFile(new URL("src/style.css", projectRoot), "utf8");

  // Verify header template has scroll-progress-bar
  assert.match(headerHtml, /id="scrollProgressBar"/);

  // Verify components/index.js has initScrollProgressBar and calculates progress percentage
  assert.match(componentsJs, /export function initScrollProgressBar/);
  assert.match(componentsJs, /initScrollProgressBar\(\)/);
  assert.match(componentsJs, /\(scrollTop \/ docHeight\) \* 100/);

  // Verify style.css defines .scroll-progress-bar fixed at top with accent gradient
  assert.match(styleCss, /\.scroll-progress-bar\s*\{/);
  assert.match(styleCss, /position:\s*fixed/);
  assert.match(styleCss, /top:\s*0/);
  assert.match(styleCss, /height:\s*3px/);
});

