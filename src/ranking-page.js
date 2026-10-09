import "./style.css";
import "./ranking-page.css";
import { getMovieDB, getMovieGenres } from "./data/data.js";
import { loadReviews } from "./data/reviews.js";
import {
  bindAccountActions,
  getPosterStyle,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

const movies = getMovieDB();
const reviews = loadReviews();

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function scoreFor(movie) {
  const list = reviews.filter((review) => review.movieTitle === movie.title);
  if (!list.length) return Number(movie.rating);
  return Number(
    (
      (list.reduce((sum, review) => sum + Number(review.rating), 0) /
        list.length) *
      2
    ).toFixed(1),
  );
}
function reviewCount(movie) {
  return reviews.filter((review) => review.movieTitle === movie.title).length;
}

const rankedMovies = [...movies].sort((a, b) => scoreFor(b) - scoreFor(a));
document.querySelector("#app").innerHTML = `
  ${renderHeader({ headerClass: " new-page-header", homeHref: "/", homeActive: "", homeCurrent: "", newMoviesHref: "/new-movies.html", newMoviesActive: "", newMoviesCurrent: "", genresHref: "/genres.html", reviewsHref: "/reviews.html", reviewsActive: "", reviewsCurrent: "", favoritesHref: "/favorites.html", favoritesActive: "", favoritesCurrent: "", rankingHref: "/ranking.html", rankingActive: "active", rankingCurrent: 'aria-current="page"', headerActions: `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu">☰</button>` })}
  <main class="ranking-page">
    <section class="ranking-intro"><div class="container ranking-intro-inner"><div><p class="eyebrow">MovieVerse chart</p><h1>Top phim<br /><em>được yêu thích.</em></h1><p>Những bộ phim đang dẫn đầu bảng xếp hạng dựa trên điểm đánh giá từ cộng đồng MovieVerse.</p></div><div class="ranking-mark">TOP<br /><strong>10</strong></div></div></section>
    <section class="container ranking-content">
      <div class="ranking-heading"><div><p class="eyebrow">Bảng xếp hạng</p><h2>Những phim đáng xem nhất</h2></div><span id="rankingUpdated"></span></div>
      <div class="ranking-podium" id="rankingPodium"></div>
      <div class="ranking-tools"><input id="rankingSearch" type="search" placeholder="Tìm tên phim..." aria-label="Tìm tên phim"><select id="rankingGenre" aria-label="Lọc thể loại"><option value="all">Tất cả thể loại</option></select></div>
      <div class="ranking-table" id="rankingTable"></div>
    </section>
  </main>
  ${renderFooter({ footerClass: "", homeHref: "/", newMoviesHref: "/new-movies.html", rankingHref: "/ranking.html", genresHref: "/genres.html", aboutHref: "/" })}
`;

bindAccountActions();
const genreSelect = document.querySelector("#rankingGenre");
const genres = [...new Set(movies.flatMap(getMovieGenres))].sort((a, b) =>
  a.localeCompare(b, "vi"),
);
genreSelect.insertAdjacentHTML(
  "beforeend",
  genres
    .map(
      (genre) =>
        `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`,
    )
    .join(""),
);

document.querySelector("#rankingUpdated").textContent =
  `${rankedMovies.length} phim trong bảng xếp hạng`;
function scoreStars(score) {
  const stars = Math.min(5, Math.max(0, Math.round(score / 2)));
  return `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`;
}
function render() {
  const query = document
    .querySelector("#rankingSearch")
    .value.trim()
    .toLocaleLowerCase("vi");
  const genre = genreSelect.value;
  const shown = rankedMovies.filter(
    (movie) =>
      movie.title.toLocaleLowerCase("vi").includes(query) &&
      (genre === "all" || getMovieGenres(movie).includes(genre)),
  );
  const podium = rankedMovies.slice(0, 3);
  document.querySelector("#rankingPodium").innerHTML = podium
    .map(
      (movie, index) =>
        `<a class="podium-item podium-${index + 1}" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}"><span class="podium-rank">0${index + 1}</span><span class="podium-poster" style="${getPosterStyle(movie)}"></span><span class="podium-info"><strong>${escapeHtml(movie.title)}</strong><small>${escapeHtml(movie.genre)} · ${reviewCount(movie)} review</small><b>★ ${scoreFor(movie).toFixed(1)}</b></span></a>`,
    )
    .join("");
  document.querySelector("#rankingTable").innerHTML = shown.length
    ? shown
        .map(
          (movie) =>
            `<a class="ranking-row" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}"><span class="ranking-number">${String(rankedMovies.indexOf(movie) + 1).padStart(2, "0")}</span><span class="ranking-row-poster" style="${getPosterStyle(movie)}"></span><span class="ranking-row-title"><strong>${escapeHtml(movie.title)}</strong><small>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</small></span><span class="ranking-row-reviews">${reviewCount(movie)} review</span><span class="ranking-row-score"><b>★ ${scoreFor(movie).toFixed(1)}</b><small>${scoreStars(scoreFor(movie))}</small></span></a>`,
        )
        .join("")
    : '<p class="empty-note">Không tìm thấy phim phù hợp.</p>';
}
document.querySelector("#rankingSearch").addEventListener("input", render);
genreSelect.addEventListener("change", render);
document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );
render();
