import "../css/style.css";
import { getMovieDB } from "./data.js";

const movies = getMovieDB();
const REVIEWS_KEY = "movieverse_reviews";

const seedReviews = [
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
  {
    id: "rv7",
    movieTitle: "The Last Horizon",
    author: "Phương Nhi",
    rating: 5,
    comment: "Cảm giác hồi hộp và những cảnh quay ngoạn mục khiến tôi không thể rời mắt.",
    date: "17/05/2025",
  },
  {
    id: "rv8",
    movieTitle: "Blue Summer",
    author: "Khang",
    rating: 4,
    comment: "Chất lượng hình ảnh rất tốt, tình tiết dễ đi vào lòng người.",
    date: "11/05/2025",
  },
];

function loadReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [...seedReviews];
}

function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]'/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]),
  );
}

const reviews = loadReviews();

const app = document.querySelector("#app");

app.innerHTML = `
  <header class="site-header review-page-header">
    <div class="container nav-wrap">
      <a class="brand" href="/index.html" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
      <nav class="main-nav" aria-label="Điều hướng chính">
        <a href="/index.html">Trang chủ</a>
        <a href="/index.html#newMovies">Phim mới</a>
        <a href="/index.html#genres">Thể loại</a>
        <a class="active" href="/review.html">Đánh giá</a>
        <a href="/index.html#ranking">Top phim</a>
      </nav>
      <div class="nav-actions">
        <a class="login-link" href="/index.html">Về trang chủ</a>
      </div>
    </div>
  </header>

  <main class="review-page">
    <section class="review-hero container">
      <div class="review-hero-copy">
        <p class="eyebrow">Cộng đồng MovieVerse</p>
        <h1>Đánh giá phim theo cảm nhận thật.</h1>
        <p>
          Khám phá những nhận xét trung thực, thẳng thắn và giàu cảm xúc từ cộng đồng yêu phim.
        </p>
      </div>
      <div class="review-hero-stat">
        <strong id="totalReviews">0</strong>
        <span>đánh giá đã được gửi</span>
      </div>
    </section>

    <section class="review-steps container">
      <div class="step-item"><span class="step-number">1</span><div><strong>Chọn phim</strong><small>Phim bạn muốn chia sẻ</small></div></div>
      <div class="step-item"><span class="step-number">2</span><div><strong>Chấm điểm</strong><small>Đánh giá từ 1 đến 5 sao</small></div></div>
      <div class="step-item"><span class="step-number">3</span><div><strong>Gửi đánh giá</strong><small>Viết cảm nhận của bạn</small></div></div>
    </section>

    <section class="review-content container">
      <aside class="review-sidebar">
        <div class="review-card summary-panel">
          <h3>Thống kê</h3>
          <div class="stat-row">
            <span>Điểm trung bình</span>
            <strong id="avgRating">0.0</strong>
          </div>
          <div class="stat-row">
            <span>Phim nhiều đánh giá</span>
            <strong id="mostReviewed">-</strong>
          </div>
          <div class="stat-row">
            <span>Người đánh giá</span>
            <strong id="reviewUsers">0</strong>
          </div>
        </div>

        <div class="review-card form-panel">
          <h3>Viết đánh giá</h3>
          <form id="reviewForm">
            <label>
              Chọn phim
              <select id="movieSelect" required></select>
            </label>
            <label>
              Tên của bạn
              <input id="reviewAuthor" type="text" maxlength="30" placeholder="Ví dụ: Lan Anh" required />
            </label>
            <label>
              Đánh giá của bạn
              <div class="star-input" id="starInput"></div>
            </label>
            <label>
              Cảm nhận
              <textarea id="reviewComment" rows="4" placeholder="Bạn thích điểm gì nhất ở bộ phim này?" required></textarea>
            </label>
            <div class="review-form-foot">
              <p id="reviewHint" aria-live="polite"></p>
              <button type="submit" class="watch-button">Gửi đánh giá</button>
            </div>
          </form>
        </div>
      </aside>

      <div class="review-list-panel">
        <div class="review-card list-header">
          <div>
            <p class="eyebrow">Bình luận mới nhất</p>
            <h2>Đánh giá cộng đồng</h2>
          </div>
        </div>
        <div id="reviewList" class="review-list"></div>
      </div>
    </section>
  </main>
`;

let selectedRating = 0;
let currentMovieTitle = "";

function renderMovieOptions() {
  const select = document.querySelector("#movieSelect");
  select.innerHTML = movies
    .map(
      (movie) =>
        `<option value="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</option>`,
    )
    .join("");
  currentMovieTitle = movies[0]?.title ?? "";
  select.value = currentMovieTitle;
}

function renderStarInput() {
  const starInput = document.querySelector("#starInput");
  starInput.innerHTML = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="star" data-star="${n}" aria-label="Chọn ${n} sao">★</button>`,
    )
    .join("");

  starInput.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("mouseenter", () => setStars(Number(star.dataset.star), true));
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.star);
      setStars(selectedRating, false);
      const hint = document.querySelector("#reviewHint");
      hint.textContent = `Bạn đã chấm ${selectedRating}/5 sao`;
      hint.style.color = "var(--accent)";
    });
  });

  starInput.addEventListener("mouseleave", () => setStars(selectedRating, false));
}

function setStars(count, preview = false) {
  document.querySelectorAll("#starInput .star").forEach((star) => {
    const value = Number(star.dataset.star);
    star.classList.toggle("filled", value <= count);
    if (preview && value > count) star.classList.remove("filled");
  });
}

function renderStats() {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / total
    : 0;
  const movieCounts = reviews.reduce((acc, review) => {
    acc[review.movieTitle] = (acc[review.movieTitle] || 0) + 1;
    return acc;
  }, {});
  const mostReviewed = Object.entries(movieCounts).sort((a, b) => b[1] - a[1])[0];
  const uniqueAuthors = new Set(reviews.map((review) => review.author.trim().toLowerCase())).size;

  document.querySelector("#totalReviews").textContent = String(total);
  document.querySelector("#avgRating").textContent = average ? average.toFixed(1) : "0.0";
  document.querySelector("#mostReviewed").textContent = mostReviewed ? mostReviewed[0] : "-";
  document.querySelector("#reviewUsers").textContent = String(uniqueAuthors);
}

function renderReviews() {
  const list = [...reviews].sort((a, b) => {
    const dateA = new Date(String(a.date).split('/').reverse().join('-'));
    const dateB = new Date(String(b.date).split('/').reverse().join('-'));
    return dateB - dateA;
  });

  const reviewList = document.querySelector("#reviewList");
  reviewList.innerHTML = list.length
    ? list
        .map(
          (review) => `
            <article class="review-item">
              <div class="review-avatar">${escapeHtml(review.author.charAt(0))}</div>
              <div class="review-body">
                <div class="review-top">
                  <div>
                    <strong>${escapeHtml(review.author)}</strong>
                    <span>${escapeHtml(review.movieTitle)}</span>
                  </div>
                  <span class="review-date">${escapeHtml(review.date)}</span>
                </div>
                <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                <p>${escapeHtml(review.comment)}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : '<p class="review-empty">Chưa có đánh giá nào. Hãy là người đầu tiên viết cảm nhận!</p>';
}

function submitReview(event) {
  event.preventDefault();

  const author = document.querySelector("#reviewAuthor").value.trim();
  const comment = document.querySelector("#reviewComment").value.trim();
  const movieSelect = document.querySelector("#movieSelect");
  const hint = document.querySelector("#reviewHint");

  if (!selectedRating) {
    hint.textContent = "Hãy chọn số sao bạn muốn chấm.";
    hint.style.color = "#ff6b5c";
    return;
  }
  if (!author) {
    hint.textContent = "Hãy nhập tên của bạn.";
    hint.style.color = "#ff6b5c";
    document.querySelector("#reviewAuthor").focus();
    return;
  }
  if (!comment) {
    hint.textContent = "Hãy viết cảm nhận của bạn.";
    hint.style.color = "#ff6b5c";
    document.querySelector("#reviewComment").focus();
    return;
  }

  const selectedMovie = movieSelect.value;
  reviews.unshift({
    id: uid(),
    movieTitle: selectedMovie,
    author,
    rating: selectedRating,
    comment,
    date: new Date().toLocaleDateString("vi-VN"),
  });

  saveReviews(reviews);
  document.querySelector("#reviewForm").reset();
  selectedRating = 0;
  setStars(0, false);
  hint.textContent = "Cảm ơn bạn đã chia sẻ đánh giá!";
  hint.style.color = "var(--accent)";
  renderStats();
  renderReviews();
}

renderMovieOptions();
renderStarInput();
renderStats();
renderReviews();

document.querySelector("#reviewForm").addEventListener("submit", submitReview);
document.querySelector("#movieSelect").addEventListener("change", (event) => {
  currentMovieTitle = event.target.value;
});
