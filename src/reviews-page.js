import "./style.css";
import "./reviews-page.css";
import { getMovieDB, genreList } from "./data/data.js";
import { addReview, loadReviews } from "./data/reviews.js";
import { renderFooter, renderHeader } from "./components/index.js";

const movies = getMovieDB();
let reviews = loadReviews();
let selectedRating = 0;

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
    reviewsActive: "active",
    reviewsCurrent: 'aria-current="page"',
    rankingHref: "/#ranking",
    headerActions,
  })}
  <main class="reviews-page">
    <section class="reviews-intro">
      <div class="container reviews-intro-inner">
        <div>
          <p class="eyebrow">MovieVerse community</p>
          <h1>Những góc nhìn<br /><em>đáng tin</em> về phim.</h1>
          <p class="reviews-lead">Đọc cảm nhận thật từ những người đã xem. Tìm bộ phim tiếp theo bằng trải nghiệm của cộng đồng.</p>
        </div>
        <div class="reviews-intro-note"><span>01</span><p>Đọc trước<br />khi xem sau.</p></div>
      </div>
    </section>

    <section class="container reviews-workspace">
      <div class="reviews-main">
        <div class="reviews-stats" id="reviewStats"></div>
        <div class="reviews-toolbar">
          <div>
            <p class="eyebrow">Bảng tin cộng đồng</p>
            <h2>Review mới nhất</h2>
          </div>
          <div class="review-controls">
            <label class="review-search"><span aria-hidden="true">⌕</span><input id="reviewSearch" type="search" placeholder="Tìm theo tên phim..." /></label>
            <select id="reviewSort" aria-label="Sắp xếp đánh giá"><option value="newest">Mới nhất</option><option value="highest">Điểm cao nhất</option><option value="lowest">Điểm thấp nhất</option></select>
          </div>
        </div>
        <div class="review-filters" id="reviewFilters"></div>
        <div class="community-review-list" id="communityReviewList"></div>
      </div>

      <aside class="review-compose" id="writeReview">
        <div class="compose-top"><span class="compose-mark">✦</span><span>Viết review</span></div>
        <h2>Bộ phim nào<br />đang ở trong đầu bạn?</h2>
        <p>Ghi lại cảm nhận của bạn và giúp người khác chọn được một bộ phim hay.</p>
        <form id="communityReviewForm" novalidate>
          <label for="reviewMovie">Chọn phim</label>
          <select id="reviewMovie" required></select>
          <label for="communityAuthor">Tên hiển thị</label>
          <input id="communityAuthor" type="text" maxlength="30" placeholder="Ví dụ: Minh Anh" required />
          <label>Điểm của bạn</label>
          <div class="compose-rating-row">
            <div class="compose-stars" id="composeStars" role="radiogroup" aria-label="Chọn số sao"></div>
            <span class="compose-rating-value" id="composeRatingValue">Chưa chọn</span>
          </div>
          <label for="communityComment">Cảm nhận</label>
          <textarea id="communityComment" rows="5" maxlength="280" placeholder="Điều gì khiến bạn thích hoặc chưa thích bộ phim?" required></textarea>
          <p class="compose-hint" id="composeHint" aria-live="polite">Chia sẻ ngắn gọn, chân thật và tôn trọng.</p>
          <button class="tb-btn tb-btn-primary compose-submit" type="submit">Đăng đánh giá <span aria-hidden="true">→</span></button>
        </form>
      </aside>
    </section>
  </main>
  ${renderFooter({ footerClass: "", homeHref: "/", newMoviesHref: "/new-movies.html", rankingHref: "/#ranking", genresHref: "/#genres", aboutHref: "/" })}
`;

const movieSelect = document.querySelector("#reviewMovie");
movieSelect.innerHTML = movies.map((movie) => `<option value="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</option>`).join("");

const filters = ["Tất cả", ...genreList];
document.querySelector("#reviewFilters").innerHTML = filters.map((filter, index) => `<button class="review-filter ${index === 0 ? "active" : ""}" type="button" data-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("");

let activeFilter = "Tất cả";
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function movieForReview(review) {
  return movies.find((movie) => movie.title === review.movieTitle);
}
function stars(rating) {
  const score = Number(rating);
  return `${"★".repeat(score)}${"☆".repeat(5 - score)}`;
}
function renderStats() {
  const average = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length : 0;
  const fiveStar = reviews.length ? Math.round((reviews.filter((item) => Number(item.rating) === 5).length / reviews.length) * 100) : 0;
  document.querySelector("#reviewStats").innerHTML = `<div class="review-stat-highlight"><span>Điểm trung bình</span><strong>${average.toFixed(1)}</strong><small>trên 5 sao</small></div><div><span>Tổng đánh giá</span><strong>${reviews.length}</strong><small>góc nhìn đã chia sẻ</small></div><div><span>Đánh giá 5 sao</span><strong>${fiveStar}%</strong><small>từ cộng đồng</small></div>`;
}
function renderReviews() {
  const query = document.querySelector("#reviewSearch").value.trim().toLocaleLowerCase("vi");
  const sort = document.querySelector("#reviewSort").value;
  const shown = reviews.filter((review) => {
    const movie = movieForReview(review);
    const matchesFilter = activeFilter === "Tất cả" || movie?.genre === activeFilter;
    return matchesFilter && review.movieTitle.toLocaleLowerCase("vi").includes(query);
  }).sort((a, b) => {
    if (sort === "highest" || sort === "lowest") return (Number(b.rating) - Number(a.rating)) * (sort === "highest" ? 1 : -1);
    return new Date(String(b.date).split("/").reverse().join("-")) - new Date(String(a.date).split("/").reverse().join("-"));
  });

  document.querySelector("#communityReviewList").innerHTML = shown.length ? shown.map((review) => {
    const movie = movieForReview(review);
    return `<article class="community-review-card"><div class="community-review-poster" style="background-image:url('${movie?.poster || ""}')"></div><div class="community-review-content"><div class="community-review-heading"><div><span class="review-card-movie">${escapeHtml(review.movieTitle)}</span><h3>${escapeHtml(review.author)}</h3></div><span class="community-review-date">${escapeHtml(review.date)}</span></div><div class="community-rating"><span>${stars(review.rating)}</span><b>${review.rating}.0</b></div><p>${escapeHtml(review.comment)}</p><a href="/movie-detail.html?id=${encodeURIComponent(movie?.id || "")}">Xem trang phim <span>↗</span></a></div></article>`;
  }).join("") : '<p class="review-empty-note">Không tìm thấy review phù hợp. Thử đổi bộ lọc hoặc viết một review mới.</p>';
}
function paintComposeStars(count) {
  document.querySelectorAll("#composeStars button").forEach((star) => {
    const isSelected = Number(star.dataset.star) === count;
    star.classList.toggle("filled", Number(star.dataset.star) <= count);
    star.setAttribute("aria-checked", String(isSelected));
  });
  document.querySelector("#composeRatingValue").textContent = count ? `${count}/5 sao` : "Chưa chọn";
}
document.querySelector("#composeStars").innerHTML = [1, 2, 3, 4, 5].map((number) => `<button type="button" role="radio" data-star="${number}" aria-checked="false" aria-label="Chọn ${number} sao">★</button>`).join("");
document.querySelectorAll("#composeStars button").forEach((star) => {
  star.addEventListener("mouseenter", () => paintComposeStars(Number(star.dataset.star)));
  star.addEventListener("click", () => { selectedRating = Number(star.dataset.star); paintComposeStars(selectedRating); });
  star.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextRating = Math.min(5, Math.max(1, selectedRating + (event.key === "ArrowRight" ? 1 : -1)));
    selectedRating = nextRating;
    paintComposeStars(selectedRating);
    document.querySelector(`#composeStars button[data-star="${nextRating}"]`).focus();
  });
});
document.querySelector("#composeStars").addEventListener("mouseleave", () => paintComposeStars(selectedRating));
document.querySelectorAll(".review-filter").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".review-filter").forEach((item) => item.classList.toggle("active", item === button));
  renderReviews();
}));
document.querySelector("#reviewSearch").addEventListener("input", renderReviews);
document.querySelector("#reviewSort").addEventListener("change", renderReviews);
document.querySelector("#communityReviewForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const hint = document.querySelector("#composeHint");
  const author = document.querySelector("#communityAuthor").value.trim();
  const comment = document.querySelector("#communityComment").value.trim();
  if (!selectedRating || !author || !comment) {
    hint.textContent = !selectedRating ? "Hãy chọn số sao cho phim." : !author ? "Hãy nhập tên hiển thị của bạn." : "Hãy viết cảm nhận trước khi đăng.";
    hint.classList.add("is-error");
    return;
  }
  addReview({ movieTitle: movieSelect.value, author, rating: selectedRating, comment });
  reviews = loadReviews();
  event.target.reset();
  selectedRating = 0;
  paintComposeStars(0);
  hint.textContent = "Đã đăng review. Cảm ơn bạn đã chia sẻ!";
  hint.classList.remove("is-error");
  renderStats();
  renderReviews();
});
document.querySelector(".menu-toggle").addEventListener("click", () => document.querySelector(".main-nav").classList.toggle("mobile-open"));
renderStats();
renderReviews();
