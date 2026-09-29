import "./style.css";
import { getMovieDB } from "./data/data.js";

const newMovies = getMovieDB().filter((movie) => movie.isNew);

document.querySelector("#app").innerHTML = `
  <header class="site-header new-page-header">
    <div class="container nav-wrap">
      <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
      <nav class="main-nav" aria-label="Điều hướng chính">
        <a href="/">Trang chủ</a>
        <a class="active" href="/new-movies.html" aria-current="page">Phim mới</a>
        <a href="/#genres">Thể loại</a>
        <a href="/#communityReviews">Đánh giá</a>
        <a href="/#ranking">Top phim</a>
      </nav>
      <div class="nav-actions">
        <a class="login-link" href="/">Về trang chủ <span aria-hidden="true">→</span></a>
        <button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <main class="new-page-main">
    <section class="new-page-intro">
      <div class="container new-page-intro-inner">
        <p class="eyebrow">Vừa cập nhật · MovieVerse</p>
        <h1>Phim mới</h1>
        <p class="new-page-description">Những câu chuyện mới vừa có mặt trong kho phim.</p>
        <a class="new-page-home-link" href="/#home">Khám phá trang chủ <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <section class="content-section container new-page-list" aria-labelledby="newMoviesHeading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Danh sách phim</p>
          <h2 id="newMoviesHeading">Mới ra mắt <span class="new-page-count" id="newMovieCount"></span></h2>
        </div>
      </div>
      <div class="new-page-filters">
        <label class="sr-only" for="newMovieSearch">Tìm tên phim</label>
        <input id="newMovieSearch" type="search" placeholder="Tìm phim mới..." autocomplete="off">
        <label class="sr-only" for="newMovieGenre">Lọc thể loại</label>
        <select id="newMovieGenre">
          <option value="all">Tất cả thể loại</option>
        </select>
      </div>
      <div class="movie-grid new-page-grid" id="newMovieGrid"></div>
    </section>
  </main>

  <footer class="site-footer new-page-footer">
    <div class="container footer-bottom">
      <a href="/">← Quay về MovieVerse</a>
      <span>© 2024 MovieVerse</span>
    </div>
  </footer>
`;

const grid = document.querySelector("#newMovieGrid");
const searchInput = document.querySelector("#newMovieSearch");
const genreSelect = document.querySelector("#newMovieGenre");

const genres = [...new Set(newMovies.map((movie) => movie.genre))].sort(
  (a, b) => a.localeCompare(b, "vi"),
);
genreSelect.insertAdjacentHTML(
  "beforeend",
  genres.map((genre) => `<option value="${genre}">${genre}</option>`).join(""),
);

document.querySelector("#newMovieCount").textContent = `${newMovies.length}`;

function renderMovies() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const genre = genreSelect.value;
  const filteredMovies = newMovies.filter((movie) => {
    const matchesQuery = movie.title.toLocaleLowerCase("vi").includes(query);
    return matchesQuery && (genre === "all" || movie.genre === genre);
  });

  grid.innerHTML = filteredMovies.length
    ? filteredMovies
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="new-page-poster-link" href="/watch.html?id=${movie.id}" aria-label="Xem phim ${movie.title}"><div class="poster" style="background-image:url('${movie.poster}')"><span class="new-movie-badge">Mới</span></div></a><h3><a href="/movie-detail.html?id=${movie.id}">${movie.title}</a><span class="card-rating">★ ${Number(movie.rating).toFixed(1)}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Không tìm thấy phim phù hợp.</p>';
}

searchInput.addEventListener("input", renderMovies);
genreSelect.addEventListener("change", renderMovies);
renderMovies();

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
