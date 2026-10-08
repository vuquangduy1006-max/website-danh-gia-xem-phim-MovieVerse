import "./style.css";
import { getMovieDB, getMovieGenres } from "./data/data.js";
import { loadReviews } from "./data/reviews.js";
import { loadFavorites } from "./data/favorites.js";
import { rankMovieRecommendations } from "./data/recommendations.js";
import { initMovieAssistant } from "./assistant.js";
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
const heroMovies = [...movies]
  .sort((a, b) => Number(b.rating) - Number(a.rating))
  .slice(0, 3);
const newMovies = movies.filter((movie) => movie.isNew);

let currentSlide = 0;
let slideTimer;

const reviews = loadReviews().filter((review) => !review.hidden);

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

const headerActions = `<form class="header-search" id="headerSearch" role="search">
  <label class="sr-only" for="searchInput">Tìm phim</label>
  <input id="searchInput" type="search" placeholder="Tìm phim..." autocomplete="off" aria-controls="searchResults">
  <button class="header-search-button" type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">⌕</button>
  <div class="search-results" id="searchResults" aria-live="polite"></div>
</form>
${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu">☰</button>`;

document.querySelector("#app").innerHTML = `
${renderHeader({
  headerClass: "",
  homeHref: "#home",
  homeActive: "active",
  homeCurrent: 'aria-current="page"',
  newMoviesHref: "/new-movies.html",
  newMoviesActive: "",
  newMoviesCurrent: "",
  genresHref: "/genres.html",
  reviewsHref: "/reviews.html",
  favoritesHref: "/favorites.html",
  favoritesActive: "",
  favoritesCurrent: "",
  rankingHref: "/ranking.html",
  rankingActive: "",
  rankingCurrent: "",
  headerActions,
})}

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
      <a class="text-link" href="/new-movies.html">Phim mới <span>→</span></a>
    </div>
    <div class="genre-pills" id="genres"></div>
    <section class="recommendation-tool" aria-labelledby="recommendationHeading">
      <div class="recommendation-copy">
        <p class="eyebrow">MovieVerse Match</p>
        <h2 id="recommendationHeading">Tối nay bạn muốn xem gì?</h2>
        <p>Gợi ý dựa trên mô tả, phim yêu thích và đánh giá trên thiết bị này.</p>
      </div>
      <form class="recommendation-form" id="recommendationForm">
        <label class="sr-only" for="recommendationQuery">Mô tả phim bạn muốn xem</label>
        <input id="recommendationQuery" type="search" maxlength="120" placeholder="Ví dụ: hoạt hình ấm áp cho cả nhà">
        <button class="recommendation-submit" type="submit">Gợi ý phim <span aria-hidden="true">→</span></button>
      </form>
      <div class="recommendation-results" id="recommendationResults" aria-live="polite"></div>
    </section>
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

  <section class="content-section container" id="communityReviews">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Cộng đồng</p>
        <h2>Đánh giá từ khán giả</h2>
      </div>
      <a class="text-link" href="#home">Xem thêm <span>→</span></a>
    </div>
    <div class="review-summary">
      <div class="review-stat">
        <span class="stat-label">Điểm trung bình</span>
        <strong id="avgRatingStat">0.0</strong>
        <small id="reviewCountStat">0 đánh giá</small>
      </div>
      <div class="review-stat">
        <span class="stat-label">Phim được yêu thích</span>
        <strong id="topReviewMovie">-</strong>
        <small>theo lượng đánh giá</small>
      </div>
      <div class="review-stat">
        <span class="stat-label">Cộng đồng</span>
        <strong>94%</strong>
        <small>đánh giá tích cực</small>
      </div>
    </div>
    <div class="home-review-grid" id="homeReviewGrid"></div>
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

${renderFooter({
  footerClass: "",
  homeHref: "#home",
  newMoviesHref: "/new-movies.html",
  rankingHref: "#ranking",
  genresHref: "/genres.html",
  aboutHref: "#home",
})}

`;

bindAccountActions();
initMovieAssistant(movies);

renderGenrePills();
renderHero();
renderRecommendations();
const requestedGenre = new URLSearchParams(window.location.search).get("genre");
const selectedGenre = availableGenres.includes(requestedGenre)
  ? requestedGenre
  : "all";
renderMovies(selectedGenre);
if (selectedGenre !== "all") {
  requestAnimationFrame(() =>
    document.querySelector("#movies").scrollIntoView(),
  );
}
renderRanking();
renderNewMovies();
renderHomeReviews();

document.querySelector("#newCount").textContent =
  `${newMovies.length} phim mới`;

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

document.querySelector("#headerSearch").addEventListener("submit", (event) => {
  event.preventDefault();
  const first = document.querySelector("#searchResults a.search-result");
  if (first) window.location.href = first.href;
});
document.querySelector("#searchInput").addEventListener("focus", (event) => renderSearch(event.target.value));
document
  .querySelector("#recommendationForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    renderRecommendations(document.querySelector("#recommendationQuery").value);
  });
document
  .querySelector("#searchInput")
  .addEventListener("input", (event) => renderSearch(event.target.value));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header-search")) closeSearch();
});

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
  if (event.key === "Escape") closeSearch();
});

function posterStyle(movie) {
  return `background-image:url('${movie.poster}')`;
}

function renderGenrePills() {
  const pills = ["all", ...availableGenres];
  document.querySelector("#genres").innerHTML = pills
    .map(
      (genre) =>
        `<button class="pill ${genre === "all" ? "active" : ""}" data-filter="${genre}">${genre === "all" ? "Tất cả" : genre}</button>`,
    )
    .join("");
  document.querySelectorAll(".pill").forEach((pill) =>
    pill.addEventListener("click", () => {
      document
        .querySelectorAll(".pill")
        .forEach((item) => item.classList.remove("active"));
      pill.classList.add("active");
      renderMovies(pill.dataset.filter);
    }),
  );
}

function renderHero() {
  document.querySelector("#heroSlides").innerHTML = heroMovies
    .map(
      (movie, index) =>
        `<article class="hero-slide ${index === 0 ? "active" : ""}" style="background-image:url('${movie.backdrop}')"><div class="hero-copy"><span class="kicker">Phim nổi bật · ${movie.year}</span><h1>${movie.title}</h1><div class="hero-meta"><span>IMDb <strong>${movie.rating}</strong></span><span>${movie.genre}</span><span>2h 46m</span></div><p>${movie.description}</p><a class="watch-button" href="${watchUrl(movie)}">▶ &nbsp;Xem ngay</a></div></article>`,
    )
    .join("");
  document.querySelector("#sliderDots").innerHTML = heroMovies
    .map(
      (_, index) =>
        `<button class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Đến phim ${index + 1}"></button>`,
    )
    .join("");
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
  document
    .querySelectorAll(".pill")
    .forEach((pill) =>
      pill.classList.toggle("active", pill.dataset.filter === filter),
    );
  const shown =
    filter === "all"
      ? movies
      : movies.filter((movie) => getMovieGenres(movie).includes(filter));
  const grid = document.querySelector("#movieGrid");
  grid.innerHTML = shown.length
    ? shown
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" style="${posterStyle(movie)}" data-movie="${movie.title}" aria-label="Xem phim ${movie.title}"><span class="play-circle" aria-hidden="true">▶</span></a><h3><a href="${detailUrl(movie)}">${movie.title}</a><span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';
  bindDetailLinks("#movieGrid");
}

function renderRecommendations(query = "") {
  const results = rankMovieRecommendations({
    movies,
    reviews,
    favoriteIds: loadFavorites(),
    query,
  });
  document.querySelector("#recommendationResults").innerHTML = results.length
    ? results
        .map(
          ({ movie, reasons }, index) => `
            <article class="recommendation-card" style="animation-delay:${index * 0.08}s">
              <a class="recommendation-poster" href="${detailUrl(movie)}" style="background-image:url('${escapeHtml(movie.poster)}')" aria-label="Xem chi tiết ${escapeHtml(movie.title)}"></a>
              <div class="recommendation-card-copy">
                <p class="recommendation-reasons">${reasons.map(escapeHtml).join(" · ")}</p>
                <h3><a href="${detailUrl(movie)}">${escapeHtml(movie.title)}</a></h3>
                <p>${escapeHtml(movie.year)} · ★ ${escapeHtml(movie.rating)}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : '<p class="empty-note">Chưa đủ dữ liệu để đưa ra gợi ý.</p>';
}

function detailUrl(movie) {
  return `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;
}

function watchUrl(movie) {
  return `/watch.html?id=${encodeURIComponent(movie.id)}`;
}

function bindDetailLinks(selector) {
  document.querySelectorAll(`${selector} [data-movie]`).forEach((node) => {
    const movie = movies.find((item) => item.title === node.dataset.movie);
    if (movie) node.href = watchUrl(movie);
  });
}

function getMovieReviewAverage(title) {
  const movieReviews = reviews.filter((review) => review.movieTitle === title);
  if (!movieReviews.length) {
    const movie = movies.find((item) => item.title === title);
    return Number(movie?.rating ?? 0);
  }

  const average =
    movieReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
    movieReviews.length;
  return Number(average.toFixed(1));
}

function renderRanking() {
  const top = [...movies]
    .sort(
      (a, b) =>
        Number(getMovieReviewAverage(b.title)) -
        Number(getMovieReviewAverage(a.title)),
    )
    .slice(0, 6);
  document.querySelector("#rankingList").innerHTML = top
    .map(
      (movie, index) =>
        `<article class="rank-item"><span class="rank-number">0${index + 1}</span><a class="rank-poster" style="${posterStyle(movie)}" href="${watchUrl(movie)}" aria-label="Xem phim ${movie.title}"></a><div class="rank-info"><h3><a href="${detailUrl(movie)}">${movie.title}</a></h3><p>${movie.year} · ${movie.genre}</p></div><span class="rank-score">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></article>`,
    )
    .join("");
}

function renderNewMovies() {
  const grid = document.querySelector("#newMovieGrid");
  grid.innerHTML = newMovies.length
    ? newMovies
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" style="${posterStyle(movie)}" data-movie="${movie.title}" aria-label="Xem phim ${movie.title}"><span class="play-circle" aria-hidden="true">▶</span></a><h3><a href="${detailUrl(movie)}">${movie.title}</a><span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim mới.</p>';
  bindDetailLinks("#newMovieGrid");
}

function renderHomeReviews() {
  const list = [...reviews]
    .sort((a, b) => {
      const dateA = new Date(String(a.date).split("/").reverse().join("-"));
      const dateB = new Date(String(b.date).split("/").reverse().join("-"));
      return dateB - dateA;
    })
    .slice(0, 3);

  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      reviews.length
    : 0;

  const movieCounts = reviews.reduce((acc, review) => {
    acc[review.movieTitle] = (acc[review.movieTitle] || 0) + 1;
    return acc;
  }, {});

  const topMovie = Object.entries(movieCounts).sort((a, b) => b[1] - a[1])[0];

  document.querySelector("#avgRatingStat").textContent = average
    ? average.toFixed(1)
    : "0.0";
  document.querySelector("#reviewCountStat").textContent =
    `${reviews.length} đánh giá`;
  document.querySelector("#topReviewMovie").textContent = topMovie
    ? topMovie[0]
    : "-";
  document.querySelector("#homeReviewGrid").innerHTML = list.length
    ? list
        .map(
          (review) => `
            <article class="home-review-card">
              <div class="review-card-header">
                <div class="review-avatar large">${escapeHtml(review.author.charAt(0))}</div>
                <div class="review-card-user">
                  <strong>${escapeHtml(review.author)}</strong>
                  <span>${escapeHtml(review.movieTitle)}</span>
                </div>
              </div>
              <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
              <p>${escapeHtml(review.comment)}</p>
              <div class="review-meta">
                <span>${escapeHtml(review.date)}</span>
                <span>⭐ ${review.rating}/5</span>
              </div>
            </article>
          `,
        )
        .join("")
    : '<p class="empty-note">Chưa có đánh giá nào từ cộng đồng.</p>';
}

function closeSearch() {
  document.querySelector(".header-search")?.classList.remove("has-results");
}

function renderSearch(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const results = movies.filter((movie) =>
    movie.title.toLocaleLowerCase("vi").includes(normalizedQuery),
  );
  const searchForm = document.querySelector(".header-search");
  const resultsBox = document.querySelector("#searchResults");
  if (!resultsBox) return;

  const suggestions = normalizedQuery ? results : [...movies].sort((a,b) => Number(b.rating)-Number(a.rating)).slice(0, 6);

  // Chỉ mở dropdown khi thực sự có kết quả để tránh hiện khung rỗng.
  searchForm?.classList.add("has-results");

  resultsBox.innerHTML = suggestions.length
    ? suggestions
        .map(
          (movie) =>
            `<a class="search-result" href="${detailUrl(movie)}"><img src="${movie.poster}" alt=""><p>${movie.title}<br><small>${movie.year} · ${movie.genre}</small></p></a>`,
        )
        .join("")
    : '<p class="search-empty">Không tìm thấy phim phù hợp.</p>';
}
