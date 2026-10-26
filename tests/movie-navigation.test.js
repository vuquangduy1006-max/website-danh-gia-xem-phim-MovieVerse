import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("home page movie cards and posters link to movie-detail.html", async () => {
  const mainJs = await readFile(new URL("src/main.js", projectRoot), "utf8");
  // Poster links in main.js should navigate to detailUrl
  assert.match(mainJs, /bindDetailLinks[\s\S]*?node\.href = detailUrl\(movie\)/);
  assert.match(mainJs, /class="poster poster-link"[\s\S]*?href="\$\{detailUrl\(movie\)\}"/);
  assert.match(mainJs, /class="rank-poster"[\s\S]*?href="\$\{detailUrl\(movie\)\}"/);
  assert.match(mainJs, /class="watch-button" href="\$\{detailUrl\(movie\)\}"/);
});

test("new movies page cards and posters link to movie-detail.html", async () => {
  const newMoviesJs = await readFile(
    new URL("src/new-movies.js", projectRoot),
    "utf8",
  );
  assert.match(newMoviesJs, /class="new-page-poster-link" href="\/movie-detail\.html\?id=/);
  assert.doesNotMatch(newMoviesJs, /class="new-page-poster-link" href="\/watch\.html\?id=/);
});

test("genres page cards and posters link to movie-detail.html", async () => {
  const genresJs = await readFile(
    new URL("src/genres-page.js", projectRoot),
    "utf8",
  );
  assert.match(genresJs, /class="poster poster-link" href="\/movie-detail\.html\?id=/);
  assert.doesNotMatch(genresJs, /class="poster poster-link" href="\/watch\.html\?id=/);
});

test("search page cards and posters link to movie-detail.html", async () => {
  const searchJs = await readFile(
    new URL("src/search-page.js", projectRoot),
    "utf8",
  );
  assert.match(searchJs, /class="poster poster-link"[\s\S]*?href="\/movie-detail\.html\?id=/);
  assert.doesNotMatch(searchJs, /class="poster poster-link"[\s\S]*?href="\/watch\.html\?id=/);
});

test("header search dropdown cards link to movie-detail.html", async () => {
  const componentsJs = await readFile(
    new URL("src/components/index.js", projectRoot),
    "utf8",
  );
  assert.match(componentsJs, /class="search-result search-result-card"[\s\S]*?href="\/movie-detail\.html\?id=/);
  assert.match(componentsJs, /window\.location\.href =\s*`\/movie-detail\.html\?id=/);
});

test("history page cards link to movie-detail.html", async () => {
  const historyJs = await readFile(
    new URL("src/history-page.js", projectRoot),
    "utf8",
  );
  assert.match(historyJs, /class="favorite-poster" href="\/movie-detail\.html\?id=/);
  assert.doesNotMatch(historyJs, /class="favorite-poster" href="\/watch\.html\?id=/);
});

test("movie detail page places similar movies below reviews and top movies under share in aside", async () => {
  const detailJs = await readFile(
    new URL("src/movie-detail.js", projectRoot),
    "utf8",
  );
  const detailCss = await readFile(
    new URL("src/movie-detail.css", projectRoot),
    "utf8",
  );

  // Checks that detailSimilarMovies is positioned after detailReviews in detail-primary
  const reviewsIndex = detailJs.indexOf('id="detailReviews"');
  const similarMoviesIndex = detailJs.indexOf('id="detailSimilarMovies"');
  const asideIndex = detailJs.indexOf('class="detail-aside"');
  const sharePanelIndex = detailJs.indexOf('id="sharePanel"');
  const topMoviesPanelIndex = detailJs.indexOf('id="topMoviesPanel"');

  assert.ok(reviewsIndex !== -1, "detailReviews must exist");
  assert.ok(similarMoviesIndex !== -1, "detailSimilarMovies must exist");
  assert.ok(asideIndex !== -1, "detail-aside must exist");
  assert.ok(sharePanelIndex !== -1, "sharePanel must exist");
  assert.ok(topMoviesPanelIndex !== -1, "topMoviesPanel must exist");

  // Phim lien quan is below reviews and in detail-primary
  assert.ok(reviewsIndex < similarMoviesIndex, "detailSimilarMovies must be below detailReviews");
  assert.ok(similarMoviesIndex < asideIndex, "detailSimilarMovies must be in detail-primary before detail-aside");

  // Top phim is below sharePanel in aside
  assert.ok(sharePanelIndex < topMoviesPanelIndex, "topMoviesPanel must be below sharePanel in aside");
  assert.ok(asideIndex < topMoviesPanelIndex, "topMoviesPanel must be inside detail-aside");

  // Checks headings, containers and links
  assert.match(detailJs, /<h2 id="similarHeading">Phim liên quan<\/h2>/);
  assert.match(detailJs, /class="similar-movies-grid" id="similarMoviesList"/);
  assert.match(detailJs, /class="similar-movie-card" href="\/movie-detail\.html\?id=/);
  assert.match(detailJs, /renderSimilarMovies\(similar\)/);

  assert.match(detailJs, /<h3 id="topHeading">Top phim<\/h3>/);
  assert.match(detailJs, /class="aside-top-list" id="topMoviesAsideList"/);
  assert.match(detailJs, /class="aside-top-item \$\{rankClass\}" href="\/movie-detail\.html\?id=/);
  assert.match(detailJs, /renderTopMoviesAside\(topRanked\)/);

  // Checks CSS definitions
  assert.match(detailCss, /\.similar-movies-grid/);
  assert.match(detailCss, /\.similar-movie-card/);
  assert.match(detailCss, /\.aside-top-list\s*\{/);
  assert.match(detailCss, /\.aside-top-item\s*\{/);
  assert.match(detailCss, /\.aside-top-rank\s*\{/);
});

