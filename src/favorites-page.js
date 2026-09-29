import "./style.css";
import "./favorites-page.css";
import { getMovieDB } from "./data/data.js";
import { loadFavorites, removeFavorite } from "./data/favorites.js";
import { renderFooter, renderHeader } from "./components/index.js";

const movies = getMovieDB();

const headerActions = `<a class="login-link" href="/login.html">Đăng nhập</a><button class="menu-toggle" aria-label="Mở menu">☰</button>`;

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "/",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "/new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    genresHref: "/#genres",
    reviewsHref: "/reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "/favorites.html",
    favoritesActive: "active",
    favoritesCurrent: 'aria-current="page"',
    rankingHref: "/#ranking",
    headerActions,
  })}
  <main class="favorites-page">
    <section class="favorites-intro">
      <div class="container favorites-intro-inner">
        <div>
          <p class="eyebrow">Bộ sưu tập cá nhân</p>
          <h1>Phim <em>yêu thích</em><br />của bạn.</h1>
          <p>Lưu lại những câu chuyện bạn muốn xem lại, chia sẻ hoặc giới thiệu cho một người bạn.</p>
        </div>
        <div class="favorites-count" id="favoritesCount"></div>
      </div>
    </section>
    <section class="container favorites-content">
      <div class="favorites-heading"><div><p class="eyebrow">Đã lưu cho sau này</p><h2>Danh sách của bạn</h2></div><a class="text-link" href="/">Khám phá thêm <span>→</span></a></div>
      <div class="favorites-grid" id="favoritesGrid"></div>
    </section>
  </main>
  ${renderFooter({ footerClass: "", homeHref: "/", newMoviesHref: "/new-movies.html", rankingHref: "/#ranking", genresHref: "/#genres", aboutHref: "/" })}
`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function renderFavorites() {
  const favoriteIds = loadFavorites();
  const favoriteMovies = favoriteIds.map((id) => movies.find((movie) => movie.id === id)).filter(Boolean);
  document.querySelector("#favoritesCount").innerHTML = `<strong>${favoriteMovies.length}</strong><span>${favoriteMovies.length === 1 ? "bộ phim đã lưu" : "bộ phim đã lưu"}</span>`;
  document.querySelector("#favoritesGrid").innerHTML = favoriteMovies.length
    ? favoriteMovies.map((movie) => `<article class="favorite-card"><a class="favorite-poster" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}" style="background-image:url('${movie.poster}')"><span class="favorite-play" aria-hidden="true">▶</span></a><div class="favorite-card-body"><div><h3><a href="/movie-detail.html?id=${encodeURIComponent(movie.id)}">${escapeHtml(movie.title)}</a></h3><p>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</p></div><div class="favorite-card-foot"><span class="favorite-score">★ ${escapeHtml(movie.rating)}</span><button type="button" class="remove-favorite" data-remove-favorite="${escapeHtml(movie.id)}">Bỏ yêu thích</button></div></div></article>`).join("")
    : '<div class="favorites-empty"><span class="favorites-empty-mark">♡</span><h3>Chưa có phim yêu thích</h3><p>Bấm “Yêu thích” trên trang chi tiết phim để lưu những bộ phim bạn muốn xem lại.</p><a class="watch-button" href="/">Khám phá phim <span aria-hidden="true">→</span></a></div>';
}

document.querySelector("#favoritesGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-favorite]");
  if (!button) return;
  removeFavorite(button.dataset.removeFavorite);
  renderFavorites();
});
document.querySelector(".menu-toggle").addEventListener("click", () => document.querySelector(".main-nav").classList.toggle("mobile-open"));
renderFavorites();
