import "./style.css";
import "./favorites-page.css";
import { getMovieDB } from "./data/data.js";
import {
  clearWatchHistory,
  loadWatchHistory,
  removeHistoryItem,
} from "./data/history.js";
import {
  bindAccountActions,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

const movies = getMovieDB();
const headerActions = `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu">☰</button>`;

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "./",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "./new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    genresHref: "./genres.html",
    reviewsHref: "./reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "./favorites.html",
    favoritesActive: "",
    favoritesCurrent: "",
    rankingHref: "./ranking.html",
    rankingActive: "",
    rankingCurrent: "",
    headerActions,
  })}
  <main class="favorites-page">
    <section class="favorites-intro">
      <div class="container favorites-intro-inner">
        <div>
          <p class="eyebrow">Hoạt động gần đây</p>
          <h1>Lịch sử <em>xem phim</em><br />của bạn.</h1>
          <p>Những bộ phim bạn vừa xem sẽ xuất hiện ở đây để bạn quay lại nhanh hơn trong lần sau.</p>
        </div>
        <div class="favorites-count" id="historyCount"></div>
      </div>
    </section>
    <section class="container favorites-content">
      <div class="favorites-heading">
        <div>
          <p class="eyebrow">Xem gần đây</p>
          <h2>Danh sách phim đã xem</h2>
        </div>
        <div class="history-actions">
          <button type="button" class="text-link history-clear" id="clearHistoryBtn">Xoá lịch sử</button>
          <a class="text-link" href="./">Khám phá thêm <span>→</span></a>
        </div>
      </div>
      <div class="favorites-grid" id="historyGrid"></div>
    </section>
  </main>
  ${renderFooter({ footerClass: "", homeHref: "./", newMoviesHref: "./new-movies.html", rankingHref: "./#ranking", genresHref: "./genres.html", aboutHref: "./" })}
`;

bindAccountActions();

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Gần đây";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderHistory() {
  const history = loadWatchHistory();
  const watchedMovies = history
    .map((entry) => {
      const movie = movies.find((item) => item.id === entry.id);
      return movie ? { ...movie, viewedAt: entry.viewedAt } : null;
    })
    .filter(Boolean);

  document.querySelector("#historyCount").innerHTML =
    `<strong>${watchedMovies.length}</strong><span>${watchedMovies.length === 1 ? "bộ phim đã xem" : "bộ phim đã xem"}</span>`;

  document.querySelector("#historyGrid").innerHTML = watchedMovies.length
    ? watchedMovies
        .map(
          (movie) => `
            <article class="favorite-card">
              <a class="favorite-poster" href="./watch.html?id=${encodeURIComponent(movie.id)}" style="background-image:url('${movie.poster}')">
                <span class="favorite-play" aria-hidden="true">▶</span>
              </a>
              <div class="favorite-card-body">
                <div>
                  <h3><a href="./watch.html?id=${encodeURIComponent(movie.id)}">${escapeHtml(movie.title)}</a></h3>
                  <p>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</p>
                  <p class="history-date">Xem lần cuối: ${escapeHtml(formatDate(movie.viewedAt))}</p>
                </div>
                <div class="favorite-card-foot">
                  <span class="favorite-score">★ ${escapeHtml(movie.rating)}</span>
                  <button type="button" class="remove-favorite" data-remove-history="${escapeHtml(movie.id)}">Xoá</button>
                </div>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="favorites-empty"><span class="favorites-empty-mark">◉</span><h3>Chưa có lịch sử xem</h3><p>Bắt đầu phát phim để lưu lại những bộ bạn đã xem gần đây.</p><a class="watch-button" href="./">Khám phá phim <span aria-hidden="true">→</span></a></div>';
}

document.querySelector("#historyGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-history]");
  if (!button) return;
  removeHistoryItem(button.dataset.removeHistory);
  renderHistory();
});

document.querySelector("#clearHistoryBtn").addEventListener("click", () => {
  clearWatchHistory();
  renderHistory();
});

document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );

renderHistory();
