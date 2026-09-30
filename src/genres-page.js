import "./style.css";
import { getMovieDB, getMovieGenres } from "./data/data.js";
import {
  bindAccountActions,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

const movies = getMovieDB();
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
  <main class="new-page-main">
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

document.querySelector("#genreMovieCount").textContent =
  `${filteredMovies.length}`;
document.querySelector("#genreMovieGrid").innerHTML = filteredMovies.length
  ? filteredMovies
      .map(
        (movie, index) =>
          `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" href="/watch.html?id=${encodeURIComponent(movie.id)}" style="background-image:url('${escapeHtml(movie.poster)}')" aria-label="Xem phim ${escapeHtml(movie.title)}"><span class="play-circle" aria-hidden="true">▶</span></a><h3><a href="/movie-detail.html?id=${encodeURIComponent(movie.id)}">${escapeHtml(movie.title)}</a><span class="card-rating">★ ${escapeHtml(movie.rating)}</span></h3><p>${escapeHtml(movie.year)} · ${escapeHtml(getMovieGenres(movie).join(", "))}</p></article>`,
      )
      .join("")
  : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
