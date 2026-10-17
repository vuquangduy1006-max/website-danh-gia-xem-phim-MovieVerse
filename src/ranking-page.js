import "./style.css";
import "./ranking-page.css";
import {
  getMovieDB,
  getMovieGenres,
  initializeCatalog,
} from "./data/data.js";
import {
  loadReviews,
  syncReviews,
} from "./data/reviews.js";
import { getMovieRanking } from "./data/rankings.js";
import {
  bindAccountActions,
  getPosterStyle,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

await initializeCatalog();

const movies = getMovieDB();
const reviews = loadReviews();
const rankingPeriods = {
  all: "Mọi thời điểm",
  week: "Tuần này",
  month: "Tháng này",
};

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
let rankedMovies = getMovieRanking(movies, reviews, "all");
document.querySelector("#app").innerHTML = `
  ${renderHeader({ headerClass: " new-page-header", homeHref: "/", homeActive: "", homeCurrent: "", newMoviesHref: "/new-movies.html", newMoviesActive: "", newMoviesCurrent: "", genresHref: "/genres.html", reviewsHref: "/reviews.html", reviewsActive: "", reviewsCurrent: "", favoritesHref: "/favorites.html", favoritesActive: "", favoritesCurrent: "", rankingHref: "/ranking.html", rankingActive: "active", rankingCurrent: 'aria-current="page"', headerActions: `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu">☰</button>` })}
  <main class="ranking-page">
    <section class="ranking-intro"><div class="container ranking-intro-inner"><div><p class="eyebrow">MovieVerse chart</p><h1>Top phim<br /><em>được yêu thích.</em></h1><p>Điểm review cộng đồng được quy đổi từ thang 5 sang thang 10. Bảng mọi thời điểm dùng IMDb khi phim chưa có review; bảng tuần/tháng chỉ tính review trong giai đoạn đó.</p></div><div class="ranking-mark">TOP<br /><strong>10</strong></div></div></section>
    <section class="container ranking-content">
      <div class="ranking-heading"><div><p class="eyebrow">Bảng xếp hạng</p><h2>Những phim đáng xem nhất</h2></div><span id="rankingUpdated"></span></div>
      <div class="ranking-podium" id="rankingPodium"></div>
      <div class="ranking-tools"><input id="rankingSearch" type="search" placeholder="Tìm tên phim..." aria-label="Tìm tên phim"><select id="rankingPeriod" aria-label="Chọn khoảng thời gian"><option value="all">Mọi thời điểm</option><option value="week">Tuần này</option><option value="month">Tháng này</option></select><select id="rankingGenre" aria-label="Lọc thể loại"><option value="all">Tất cả thể loại</option></select></div>
      <div class="ranking-table" id="rankingTable"></div>
    </section>
  </main>
  ${renderFooter({ footerClass: "", homeHref: "/", newMoviesHref: "/new-movies.html", rankingHref: "/ranking.html", genresHref: "/genres.html", aboutHref: "/" })}
`;

bindAccountActions();
const genreSelect = document.querySelector("#rankingGenre");
const periodSelect = document.querySelector("#rankingPeriod");
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

function scoreStars(score) {
  const stars = Math.min(5, Math.max(0, Math.round(score / 2)));
  return `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`;
}
function render() {
  rankedMovies = getMovieRanking(movies, reviews, periodSelect.value);
  const query = document
    .querySelector("#rankingSearch")
    .value.trim()
    .toLocaleLowerCase("vi");
  const genre = genreSelect.value;
  const shown = rankedMovies.filter(
    ({ movie }) =>
      movie.title.toLocaleLowerCase("vi").includes(query) &&
      (genre === "all" || getMovieGenres(movie).includes(genre)),
  );
  const podium = rankedMovies.slice(0, 3);
  document.querySelector("#rankingUpdated").textContent =
    `${rankedMovies.length} phim · ${rankingPeriods[periodSelect.value]}`;
  document.querySelector("#rankingPodium").innerHTML = podium
    .map(
      ({ movie, reviewCount, score }, index) =>
        `<a class="podium-item podium-${index + 1}" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}"><span class="podium-rank">0${index + 1}</span><span class="podium-poster" style="${getPosterStyle(movie)}"></span><span class="podium-info"><strong>${escapeHtml(movie.title)}</strong><small>${escapeHtml(movie.genre)} · ${reviewCount} review</small><b>★ ${score.toFixed(1)}/10</b></span></a>`,
    )
    .join("");
  document.querySelector("#rankingTable").innerHTML = shown.length
    ? shown
        .map(
          ({ movie, reviewCount, score }) =>
            `<a class="ranking-row" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}"><span class="ranking-number">${String(rankedMovies.findIndex((item) => item.movie === movie) + 1).padStart(2, "0")}</span><span class="ranking-row-poster" style="${getPosterStyle(movie)}"></span><span class="ranking-row-title"><strong>${escapeHtml(movie.title)}</strong><small>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</small></span><span class="ranking-row-reviews">${reviewCount} review</span><span class="ranking-row-score"><b>★ ${score.toFixed(1)}/10</b><small>${scoreStars(score)}</small></span></a>`,
        )
        .join("")
    : `<p class="empty-note">${rankedMovies.length ? "Không tìm thấy phim phù hợp." : `Chưa có review cho ${rankingPeriods[periodSelect.value].toLocaleLowerCase("vi")}.`}</p>`;
}
document.querySelector("#rankingSearch").addEventListener("input", render);
genreSelect.addEventListener("change", render);
periodSelect.addEventListener("change", render);
document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );
render();
