import "../css/style.css";
import { getMovieDB, genreList } from "./data.js";

const movies = getMovieDB();
const heroMovies = [...movies]
  .sort((a, b) => Number(b.rating) - Number(a.rating))
  .slice(0, 3);
const newMovies = movies.filter((movie) => movie.isNew);

const REVIEWS_KEY = "movieverse_reviews";
let selectedRating = 0;
let currentMovieTitle = null;

const reviewSeed = [
  {
    id: "rv1",
    movieTitle: "Dune: Part Two",
    author: "Minh Anh",
    rating: 5,
    comment: "Visual mãn nhãn, âm thanh vang dội. Đúng là bom tấn điện ảnh năm nay!",
    date: "12/06/2025",
  },
  {
    id: "rv2",
    movieTitle: "Dune: Part Two",
    author: "Hoàng Nam",
    rating: 4,
    comment: "Kịch bản tốt nhưng hơi dài ở phân đoạn giữa phim.",
    date: "03/06/2025",
  },
  {
    id: "rv3",
    movieTitle: "Rogue Planet",
    author: "Thu Trang",
    rating: 5,
    comment: "Cảm giác mãn nhãn với những khung hình vũ trụ tuyệt đẹp.",
    date: "20/06/2025",
  },
  {
    id: "rv4",
    movieTitle: "Midnight Signal",
    author: "Quốc Bảo",
    rating: 4,
    comment: "Kịch tính từ đầu đến cuối, cái kết gây sốc.",
    date: "18/06/2025",
  },
  {
    id: "rv5",
    movieTitle: "Past Lives",
    author: "Linh Chi",
    rating: 5,
    comment: "Một bộ phim nhẹ nhàng nhưng chạm đến trái tim.",
    date: "02/06/2025",
  },
  {
    id: "rv6",
    movieTitle: "Neon City",
    author: "Đức Huy",
    rating: 3,
    comment: "Bối cảnh đẹp nhưng cốt truyện còn thiếu chiều sâu.",
    date: "25/05/2025",
  },
];

let reviews = loadReviews();

function loadReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [...reviewSeed];
}

function saveReviews() {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]),
  );
}

document.querySelector("#app").innerHTML = `
<header class="site-header">
  <div class="container nav-wrap">
    <a class="brand" href="#home" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
    <nav class="main-nav" aria-label="Điều hướng chính">
      <a class="active" href="#home">Trang chủ</a><a href="#newMovies">Phim mới</a><a href="#genres">Thể loại</a><a href="#communityReviews">Đánh giá</a><a href="#ranking">Top phim</a>
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

      <section class="reviews">
        <div class="reviews-head">
          <h3>Đánh giá từ khán giả</h3>
          <span class="review-avg" id="reviewScore"></span>
        </div>
        <form class="review-form" id="reviewForm" novalidate>
          <div class="star-input" id="starInput"></div>
          <input id="reviewAuthor" type="text" placeholder="Tên của bạn" maxlength="30">
          <textarea id="reviewComment" placeholder="Cảm nhận của bạn về bộ phim này..." rows="3"></textarea>
          <div class="review-form-foot">
            <p id="reviewHint" aria-live="polite"></p>
            <button type="submit" class="review-submit">Gửi đánh giá</button>
          </div>
        </form>
        <div class="review-list" id="reviewList"></div>
      </section>
    </div>
  </div>
</div>
`;

renderGenrePills();
renderHero();
renderMovies();
renderRanking();
renderNewMovies();
renderHomeReviews();
renderStarInput();

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
document.querySelector("#reviewForm").addEventListener("submit", submitReview);

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
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';
  document
    .querySelectorAll("#movieGrid [data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
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
    .sort((a, b) => Number(getMovieReviewAverage(b.title)) - Number(getMovieReviewAverage(a.title)))
    .slice(0, 6);
  document.querySelector("#rankingList").innerHTML = top
    .map(
      (movie, index) =>
        `<article class="rank-item"><span class="rank-number">0${index + 1}</span><div class="rank-poster" style="${posterStyle(movie)}"></div><div class="rank-info"><h3>${movie.title}</h3><p>${movie.year} · ${movie.genre}</p></div><span class="rank-score">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></article>`,
    )
    .join("");
}

function renderNewMovies() {
  const grid = document.querySelector("#newMovieGrid");
  grid.innerHTML = newMovies.length
    ? newMovies
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có phim mới.</p>';
  document
    .querySelectorAll("#newMovieGrid [data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
}

function renderHomeReviews() {
  const list = [...reviews]
    .sort((a, b) => {
      const dateA = new Date(String(a.date).split('/').reverse().join('-'));
      const dateB = new Date(String(b.date).split('/').reverse().join('-'));
      return dateB - dateA;
    })
    .slice(0, 3);

  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;

  const movieCounts = reviews.reduce((acc, review) => {
    acc[review.movieTitle] = (acc[review.movieTitle] || 0) + 1;
    return acc;
  }, {});

  const topMovie = Object.entries(movieCounts).sort((a, b) => b[1] - a[1])[0];

  document.querySelector("#avgRatingStat").textContent = average
    ? average.toFixed(1)
    : "0.0";
  document.querySelector("#reviewCountStat").textContent = `${reviews.length} đánh giá`;
  document.querySelector("#topReviewMovie").textContent = topMovie ? topMovie[0] : "-";
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

function openModal(title) {
  const movie = movies.find((item) => item.title === title);
  if (!movie) return;
  currentMovieTitle = movie.title;
  document.querySelector("#modalTitle").textContent = movie.title;
  document.querySelector("#modalDescription").textContent = movie.description;
  document.querySelector("#modalMeta").textContent =
    `${movie.year} · ${movie.genre} · 2h 14m`;
  document.querySelector("#modalRating").textContent = getMovieReviewAverage(movie.title).toFixed(1);
  document.querySelector("#modalArt").style.backgroundImage =
    `url('${movie.poster}')`;
  document.querySelector("#reviewForm").reset();
  selectedRating = 0;
  setStars(0);
  renderReviews();
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

function renderStarInput() {
  document.querySelector("#starInput").innerHTML = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="star" data-star="${n}" aria-label="Chọn ${n} sao">★</button>`,
    )
    .join("");
  const stars = document.querySelectorAll("#starInput .star");
  stars.forEach((star) =>
    star.addEventListener("mouseenter", () => {
      if (selectedRating === 0) setStars(Number(star.dataset.star));
    }),
  );
  stars.forEach((star) =>
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.star);
      setStars(selectedRating);
      const hint = document.querySelector("#reviewHint");
      hint.textContent = `Bạn đã chấm ${selectedRating}/5 sao`;
      hint.style.color = "var(--accent)";
    }),
  );
  document.querySelector("#starInput").addEventListener("mouseleave", () =>
    setStars(selectedRating),
  );
}

function setStars(count) {
  document.querySelectorAll("#starInput .star").forEach((star) => {
    star.classList.toggle("filled", Number(star.dataset.star) <= count);
  });
}

function submitReview(event) {
  event.preventDefault();
  if (!currentMovieTitle) return;
  const author = document.querySelector("#reviewAuthor").value.trim();
  const comment = document.querySelector("#reviewComment").value.trim();
  const hint = document.querySelector("#reviewHint");

  if (!selectedRating) {
    hint.textContent = "Hãy chọn số sao bạn muốn chấm.";
    hint.style.color = "#ff6b5c";
    return;
  }
  if (!author) {
    hint.textContent = "Hãy điền tên của bạn.";
    hint.style.color = "#ff6b5c";
    document.querySelector("#reviewAuthor").focus();
    return;
  }
  if (!comment) {
    hint.textContent = "Hãy viết vài cảm nhận về phim.";
    hint.style.color = "#ff6b5c";
    document.querySelector("#reviewComment").focus();
    return;
  }

  reviews.unshift({
    id: uid(),
    movieTitle: currentMovieTitle,
    author,
    rating: selectedRating,
    comment,
    date: formatDate(new Date()),
  });
  saveReviews();
  document.querySelector("#reviewForm").reset();
  selectedRating = 0;
  setStars(0);
  hint.textContent = "";
  renderHomeReviews();
  renderReviews();
}

function renderReviews() {
  const list = reviews.filter(
    (review) => review.movieTitle === currentMovieTitle,
  );
  const avg = list.length
    ? list.reduce((sum, review) => sum + Number(review.rating), 0) / list.length
    : 0;
  document.querySelector("#reviewScore").textContent = list.length
    ? `★ ${avg.toFixed(1)}/5 · ${list.length} đánh giá`
    : "Chưa có đánh giá";
  document.querySelector("#reviewList").innerHTML = list.length
    ? list
        .map(
          (review) => `
        <article class="review-item">
          <div class="review-avatar">${escapeHtml(review.author.charAt(0))}</div>
          <div class="review-body">
            <div class="review-top"><strong>${escapeHtml(review.author)}</strong><span class="review-date">${escapeHtml(review.date)}</span></div>
            <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p>${escapeHtml(review.comment)}</p>
          </div>
        </article>`,
        )
        .join("")
    : '<p class="review-empty">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!</p>';
}