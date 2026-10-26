import "./style.css";
import "./genres-page.css";
import {
  getMovieDB,
  getMovieGenres,
  initializeCatalog,
} from "./data/data.js";
import {
  getMovieScoreOutOfTen,
  loadReviews,
  syncReviews,
} from "./data/reviews.js";
import {
  bindAccountActions,
  getPosterStyle,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

await initializeCatalog();

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

const movies = getMovieDB();
const reviews = loadReviews();
const availableGenres = [...new Set(movies.flatMap(getMovieGenres))].sort(
  (a, b) => a.localeCompare(b, "vi"),
);
const requestedGenre = new URLSearchParams(window.location.search).get("genre");
const activeGenre = availableGenres.includes(requestedGenre)
  ? requestedGenre
  : "all";

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

const headerActions = `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>`;

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "/",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "/new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    genresHref: "/genres.html",
    reviewsHref: "/reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "/favorites.html",
    favoritesActive: "",
    favoritesCurrent: "",
    rankingHref: "/ranking.html",
    rankingActive: "",
    rankingCurrent: "",
    headerActions,
  })}
  <main class="new-page-main genre-page-main">
    <section class="new-page-intro">
      <div class="container new-page-intro-inner">
        <p class="eyebrow">Khám phá MovieVerse</p>
        <h1>${activeGenre === "all" ? "Thể loại phim" : escapeHtml(activeGenre)}</h1>
        <p class="new-page-description">Chọn thể loại bạn yêu thích để khám phá phim.</p>
      </div>
    </section>
    <section class="content-section container new-page-list genre-page-list" aria-labelledby="genreMoviesHeading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Danh mục điện ảnh</p>
          <h2 id="genreMoviesHeading">${activeGenre === "all" ? "Tất cả phim" : `Phim ${escapeHtml(activeGenre)}`} <span class="new-page-count" id="genreMovieCount"></span></h2>
        </div>
      </div>
      <nav class="genre-page-choices" aria-label="Chọn thể loại phim">
        <a class="genre-choice ${activeGenre === "all" ? "active" : ""}" href="/genres.html" ${activeGenre === "all" ? 'aria-current="page"' : ""}>Tất cả</a>
        ${availableGenres
          .map(
            (genre) =>
              `<a class="genre-choice ${activeGenre === genre ? "active" : ""}" href="/genres.html?genre=${encodeURIComponent(genre)}" ${activeGenre === genre ? 'aria-current="page"' : ""}>${escapeHtml(genre)}</a>`,
          )
          .join("")}
      </nav>
      <div class="movie-grid new-page-grid" id="genreMovieGrid"></div>
      <div id="genrePagination" class="movie-pagination"></div>
    </section>
  </main>
  ${renderFooter({
    footerClass: " new-page-footer",
    homeHref: "/",
    newMoviesHref: "/new-movies.html",
    rankingHref: "/ranking.html",
    genresHref: "/genres.html",
    aboutHref: "/",
  })}
`;

bindAccountActions();

const filteredMovies =
  activeGenre === "all"
    ? movies
    : movies.filter((movie) => getMovieGenres(movie).includes(activeGenre));
const MOVIES_PER_PAGE = 12;
const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

let currentPage = 1;

function renderGenreMovies(page = 1) {
  currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(
    startIndex,
    startIndex + MOVIES_PER_PAGE
  );
document.querySelector("#genreMovieCount").textContent =
  `${filteredMovies.length}`;
document.querySelector("#genreMovieGrid").innerHTML = filteredMovies.length
  ? paginatedMovies
      .map(
        (movie, index) =>
          `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" href="/movie-detail.html?id=${encodeURIComponent(movie.id)}" style="${getPosterStyle(movie)}" aria-label="Xem chi tiết ${escapeHtml(movie.title)}"><span class="play-circle" aria-hidden="true">▶</span></a><div class="movie-card-info"><h3><a href="/movie-detail.html?id=${encodeURIComponent(movie.id)}">${escapeHtml(movie.title)}</a></h3><span class="card-rating">★ ${getMovieScoreOutOfTen(movie, reviews).toFixed(1)}/10</span></div><p>${escapeHtml(movie.year)} · ${escapeHtml(getMovieGenres(movie).join(", "))}</p></article>`,
      )
      .join("")
  : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';
  const pagination = document.querySelector("#genrePagination");

  if (pagination) {
    pagination.innerHTML =
      totalPages > 1
        ? `
          <button data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹ Trước</button>
          ${Array.from({ length: totalPages }, (_, i) => `
            <button data-page="${i + 1}" class="${currentPage === i + 1 ? "active" : ""}">
              ${i + 1}
            </button>
          `).join("")}
          <button data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Sau ›</button>
        `
        : "";

    pagination.querySelectorAll("button[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        renderGenreMovies(Number(button.dataset.page));
      });
    });
  }
}

renderGenreMovies();
document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
