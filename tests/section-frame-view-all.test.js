import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("home page wraps new movies and movie collections in frames with clean view-all links", async () => {
  const mainJs = await readFile(new URL("src/main.js", projectRoot), "utf8");
  const styleCss = await readFile(new URL("src/style.css", projectRoot), "utf8");

  // Verify new movies section has frame, clean view-all link to /new-movies.html, and rail navigation arrows
  assert.match(mainJs, /id="newMovies"[\s\S]*?class="section-frame"/);
  assert.match(mainJs, /id="newViewAllLink"[\s\S]*?href="\/new-movies\.html"/);
  assert.match(mainJs, /id="newRailPrev"/);
  assert.match(mainJs, /id="newRailNext"/);

  // Verify collections also have section-frame and specific genre links
  assert.match(mainJs, /class="movie-collection section-frame"/);
  assert.match(mainJs, /\/genres\.html\?genre=\$\{encodeURIComponent\(genreQuery\)\}/);
  assert.match(mainJs, /class="rail-arrow rail-arrow-prev collection-prev"/);

  // Verify CSS contains framing, clean view-all link, and rail arrow styles
  assert.match(styleCss, /\.section-frame\s*\{/);
  assert.match(styleCss, /\.view-all-link\s*\{/);
  assert.match(styleCss, /\.rail-wrapper\s*\{/);
  assert.match(styleCss, /\.rail-arrow\s*\{/);
});
