import "../css/style.css";
import { getMovieDB, genreList } from "./data.js";

const movies = getMovieDB();
const heroMovies = [...movies]
  .sort((a, b) => Number(b.rating) - Number(a.rating))
  .slice(0, 3);
const newMovies = movies.filter((movie) => movie.isNew);

document.querySelector("#app").innerHTML = `
<header class="site-header">
  <div class="container nav-wrap">
    <a class="brand" href="#home" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
    <nav class="main-nav" aria-label="Điều hướng chính">
      <a class="active" href="#home">Trang chủ</a><a href="#newMovies">Phim mới</a><a href="#genres">Thể loại</a><a href="#ranking">Top phim</a>
    </nav>
    <div class="nav-actions">
      <button class="icon-button search-trigger" aria-label="Tìm kiếm" title="Tìm kiếm">⌕</button><a class="login-link" href="#home">Đăng nhập</a><button class="menu-toggle" aria-label="Mở menu">☰</button>
    </div>
  </div>
</header>

<main id="home">
  <section class="hero" aria-label="Phim nổi bật">
    <div class="hero-slides" id="heroSlides"></div>
    <div class="hero-controls container">
      <button class="slider-arrow" id="prevSlide" aria-label="Phim trước">←</button>
      <div class="slider-dots" id="sliderDots"></div>
      <button class="slider-arrow" id="nextSlide" aria-label="Phim tiếp theo">→</button>
    </div>
  </section>

  <section class="content-section container" id="movies">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Dành cho bạn</p>
        <h2>Khám phá điện ảnh</h2>
      </div>
      <a class="text-link" href="#movies">Xem tất cả <span>→</span></a>
    </div>
    <div class="genre-pills" id="genres"></div>
    <div class="movie-grid" id="movieGrid"></div>
  </section>

  <section class="content-section container" id="newMovies">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Vừa cập nhật</p>
        <h2>Phim mới ra mắt</h2>
      </div>
      <span class="text-link" id="newCount"></span>
    </div>
    <div class="movie-grid" id="newMovieGrid"></div>
  </section>

  <section class="content-section container" id="ranking">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Được yêu thích nhất</p>
        <h2>Top phim tuần này</h2>
      </div>
      <div class="select-wrap">
        <select id="rankFilter" aria-label="Chọn bảng xếp hạng">
          <option>Tuần này</option><option>Tháng này</option>
        </select>
      </div>
    </div>
    <div class="ranking-list" id="rankingList"></div>
  </section>

  <section class="newsletter container">
    <div>
      <p class="eyebrow">MovieVerse weekly</p>
      <h2>Đừng bỏ lỡ những thước phim hay.</h2>
      <p>Nhận thông báo về phim mới và đề xuất được chọn riêng cho bạn.</p>
    </div>
    <form class="subscribe-form" id="subscribeForm">
      <label class="sr-only" for="email">Email của bạn</label>
      <input id="email" type="email" placeholder="Email của bạn" required>
      <button type="submit">Đăng ký <span>→</span></button>
    </form>
  </section>
</main>

<footer class="site-footer">
  <div class="container footer-main">
    <div class="footer-brand">
      <a class="brand" href="#home"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
      <p>Nơi những câu chuyện điện ảnh<br>được kể theo cách của bạn.</p>
    </div>
    <div>
      <h3>Khám phá</h3>
      <a href="#newMovies">Phim mới</a><a href="#ranking">Top phim</a><a href="#genres">Thể loại</a>
    </div>
    <div>
      <h3>MovieVerse</h3>
      <a href="#home">Về chúng tôi</a><a href="#home">Trợ giúp</a><a href="#home">Điều khoản</a>
    </div>
    <div>
      <h3>Quản trị</h3>
      <a href="/admin.html">Quản lý phim</a><a href="/admin.html">Thêm phim mới</a>
    </div>
    <div>
      <h3>Theo dõi chúng tôi</h3>
      <div class="socials">
        <a href="#home" aria-label="Facebook">f</a><a href="#home" aria-label="Instagram">◎</a><a href="#home" aria-label="Youtube">▶</a>
      </div>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© 2024 MovieVerse. Made for movie lovers.</span><span>Việt Nam <span class="flag">●</span></span>
  </div>
</footer>

<div class="search-overlay" id="searchOverlay">
  <div class="search-box">
    <button class="close-search" aria-label="Đóng tìm kiếm">×</button>
    <p class="eyebrow">Tìm kiếm</p>
    <h2>Bạn muốn xem gì hôm nay?</h2>
    <input id="searchInput" type="search" placeholder="Nhập tên phim...">
    <div id="searchResults"></div>
  </div>
</div>

<div class="modal" id="movieModal" aria-hidden="true">
  <div class="modal-backdrop"></div>
  <div class="modal-card">
    <button class="modal-close" aria-label="Đóng">×</button>
    <div class="modal-art" id="modalArt"></div>
    <div class="modal-info">
      <p class="eyebrow">MovieVerse Originals</p>
      <h2 id="modalTitle"></h2>
      <p id="modalDescription"></p>
      <div class="meta">
        <span id="modalMeta"></span>
        <span class="rating">★ <b id="modalRating"></b></span>
      </div>
      <button class="watch-button">▶ Xem ngay</button>
    </div>
  </div>
</div>
`;

renderGenrePills();
renderHero();
renderMovies();
renderRanking();
renderNewMovies();

document.querySelector("#newCount").textContent = `${newMovies.length} phim mới`;

document
  .querySelector("#prevSlide")
  .addEventListener("click", () => goToSlide(currentSlide - 1));
document
  .querySelector("#nextSlide")
  .addEventListener("click", () => goToSlide(currentSlide + 1));

document.querySelectorAll(".pill").forEach((pill) =>
  pill.addEventListener("click", () => {
    document
      .querySelectorAll(".pill")
      .forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    renderMovies(pill.dataset.filter);
  }),
);

document.querySelector(".search-trigger").addEventListener("click", () => {
  document.querySelector("#searchOverlay").classList.add("open");
  document.querySelector("#searchInput").focus();
});
document.querySelector(".close-search").addEventListener("click", closeSearch);
document
  .querySelector("#searchInput")
  .addEventListener("input", (event) => renderSearch(event.target.value));
document.querySelector("#searchOverlay").addEventListener("click", (event) => {
  if (event.target.id === "searchOverlay") closeSearch();
});

document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.querySelector(".modal-close").addEventListener("click", closeModal);

document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );

document.querySelector("#subscribeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.innerHTML =
    '<p style="color:var(--accent);margin:0">Cảm ơn bạn đã đăng ký!</p>';
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeSearch();
  }
});

let currentSlide = 0;
let slideTimer;
const posterStyle = (movie) => `background-image:url('${movie.poster}')`;

function renderGenrePills() {
  const pills = ["all", ...genreList];
  document.querySelector("#genres").innerHTML = pills
    .map(
      (genre) =>
        `<button class="pill ${genre === "all" ? "active" : ""}" data-filter="${genre}">${genre === "all" ? "Tất cả" : genre}</button>`,
    )
    .join("");
  document.querySelectorAll(".pill").forEach((pill) =>
    pill.addEventListener("click", () => {
      document.querySelectorAll(".pill").forEach((item) => item.classList.remove("active"));
      pill.classList.add("active");
      renderMovies(pill.dataset.filter);
    }),
  );
}

function renderHero() {
  document.querySelector("#heroSlides").innerHTML = heroMovies
    .map(
      (movie, index) =>
        `<article class="hero-slide ${index === 0 ? "active" : ""}" style="background-image:url('${movie.backdrop}')"><div class="hero-copy"><span class="kicker">Phim nổi bật · ${movie.year}</span><h1>${movie.title}</h1><div class="hero-meta"><span>IMDb <strong>${movie.rating}</strong></span><span>${movie.genre}</span><span>2h 46m</span></div><p>${movie.description}</p><button class="watch-button" data-movie="${movie.title}">▶ &nbsp;Xem ngay</button></div></article>`,
    )
    .join("");
  document.querySelector("#sliderDots").innerHTML = heroMovies
    .map(
      (_, index) =>
        `<button class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Đến phim ${index + 1}"></button>`,
    )
    .join("");
  document
    .querySelectorAll("[data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
  document
    .querySelectorAll("[data-slide]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        goToSlide(Number(button.dataset.slide)),
      ),
    );
  startSlider();
}

function goToSlide(index) {
  currentSlide = (index + heroMovies.length) % heroMovies.length;
  document
    .querySelectorAll(".hero-slide")
    .forEach((slide, i) =>
      slide.classList.toggle("active", i === currentSlide),
    );
  document
    .querySelectorAll(".slider-dots button")
    .forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
  clearInterval(slideTimer);
  startSlider();
}

function startSlider() {
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 6500);
}

function renderMovies(filter = "all") {
  const shown =
    filter === "all"
      ? movies
      : movies.filter((movie) => movie.genre === filter);
  const grid = document.querySelector("#movieGrid");
  grid.innerHTML = shown.length
    ? shown
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${movie.rating}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';
  document
    .querySelectorAll("#movieGrid [data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
}

function renderRanking() {
  const top = [...movies]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 6);
  document.querySelector("#rankingList").innerHTML = top
    .map(
      (movie, index) =>
        `<article class="rank-item"><span class="rank-number">0${index + 1}</span><div class="rank-poster" style="${posterStyle(movie)}"></div><div class="rank-info"><h3>${movie.title}</h3><p>${movie.year} · ${movie.genre}</p></div><span class="rank-score">★ ${movie.rating}</span></article>`,
    )
    .join("");
}

function renderNewMovies() {
  const grid = document.querySelector("#newMovieGrid");
  grid.innerHTML = newMovies.length
    ? newMovies
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${movie.rating}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim mới.</p>';
  document
    .querySelectorAll("#newMovieGrid [data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
}

function openModal(title) {
  const movie = movies.find((item) => item.title === title);
  if (!movie) return;
  document.querySelector("#modalTitle").textContent = movie.title;
  document.querySelector("#modalDescription").textContent = movie.description;
  document.querySelector("#modalMeta").textContent =
    `${movie.year} · ${movie.genre} · 2h 14m`;
  document.querySelector("#modalRating").textContent = movie.rating;
  document.querySelector("#modalArt").style.backgroundImage =
    `url('${movie.poster}')`;
  document.querySelector("#movieModal").classList.add("open");
  document.querySelector("#movieModal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  document.querySelector("#movieModal").classList.remove("open");
  document.querySelector("#movieModal").setAttribute("aria-hidden", "true");
}

function closeSearch() {
  document.querySelector("#searchOverlay").classList.remove("open");
}

function renderSearch(query = "") {
  const results = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase()),
  );
  document.querySelector("#searchResults").innerHTML = query
    ? results
        .map(
          (movie) =>
            `<button class="search-result" data-movie="${movie.title}"><img src="${movie.poster}" alt=""><p>${movie.title}<br><small>${movie.year} · ${movie.genre}</small></p></button>`,
        )
        .join("")
    : '<p style="color:var(--muted);margin-top:22px">Nhập tên phim để bắt đầu tìm kiếm.</p>';
  document.querySelectorAll("#searchResults [data-movie]").forEach((button) =>
    button.addEventListener("click", () => {
      closeSearch();
      openModal(button.dataset.movie);
    }),
  );
}