import "./style.css";
import {
  getMovieDB,
  getMovieGenres,
  initializeCatalog,
} from "./data/data.js";
import { getTrailer } from "./data/media.js";
import { getMovieRanking } from "./data/rankings.js";
import {
  getMovieScoreOutOfTen,
  loadReviews,
  syncReviews,
} from "./data/reviews.js";
import { loadFavorites } from "./data/favorites.js";
import {
  isMoreRecommendationsRequest,
  rankMovieRecommendations,
} from "./data/recommendations.js";
import {
  bindAccountActions,
  getPosterStyle,
  renderAccountActions,
  renderFooter,
  renderHeader,
  updateNotificationCount,
} from "./components/index.js";

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

await initializeCatalog();

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
let previousRecommendationQuery = "";
const displayedRecommendationIds = new Set();
const MOVIES_PER_PAGE = 10;
let currentMoviePage = 1;

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

const headerActions = `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu">☰</button>`;

document.querySelector("#app").innerHTML = `
${renderHeader({
  headerClass: " home-page-header",
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

  <section class="content-section container" id="newMovies">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Vừa cập nhật</p>
        <h2>Phim mới ra mắt</h2>
      </div>
      <span class="text-link" id="newCount"></span>
    </div>
    <div class="movie-grid home-movie-rail" id="newMovieGrid"></div>
  </section>

  <section class="content-section container home-collections" id="movieCollections" aria-label="Phim theo chủ đề">
    <div id="movieCollectionRows"></div>
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
        <div class="recommendation-badge">
          <svg class="sparkle-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
          </svg>
          <span>MovieVerse Match</span>
        </div>
        <h2 id="recommendationHeading">Tối nay bạn muốn xem gì?</h2>
        <p>Mô tả thể loại, tâm trạng hoặc một phim yêu thích để nhận gợi ý chuẩn gu.</p>
      </div>
      <div class="recommendation-form-wrap">
        <form class="recommendation-form" id="recommendationForm">
          <label class="sr-only" for="recommendationQuery">Mô tả phim bạn muốn xem</label>
          <div class="recommendation-input-box">
            <span class="recommendation-input-icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input id="recommendationQuery" type="search" maxlength="120" placeholder="Ví dụ: hành động, khoa học viễn tưởng, giống Dune..." autocomplete="off">
            <button type="button" class="recommendation-clear-btn" id="recommendationClear" aria-label="Xóa nội dung" style="display: none;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <button class="recommendation-submit" type="submit">
            <span>Gợi ý phim</span>
            <svg class="submit-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>
        <div class="recommendation-chips" aria-label="Gợi ý tìm nhanh">
          <span class="chips-label">Thử ngay:</span>
          <button type="button" class="rec-chip" data-query="Hành động kịch tính">💥 Hành động</button>
          <button type="button" class="rec-chip" data-query="Khoa học viễn tưởng">🚀 Viễn tưởng</button>
          <button type="button" class="rec-chip" data-query="giống Dune">🌌 Giống Dune</button>
          <button type="button" class="rec-chip" data-query="phim nhẹ nhàng chữa lành">🌿 Chữa lành</button>
          <button type="button" class="rec-chip" data-query="IMDb trên 8">⭐ IMDb &gt; 8</button>
        </div>
      </div>
      <div class="recommendation-results" id="recommendationResults" aria-live="polite"></div>
    </section>
    <div class="movie-grid" id="movieGrid"></div>
  </section>

  <section class="content-section container" id="ranking">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Được yêu thích nhất</p>
        <h2 id="rankingTitle">Top phim tuần này</h2>
      </div>
      <div class="select-wrap">
        <select id="rankFilter" aria-label="Chọn bảng xếp hạng">
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
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
        <small><span id="reviewCountStat">0 đánh giá</span> · thang 5</small>
      </div>
      <div class="review-stat">
        <span class="stat-label">Phim được yêu thích</span>
        <strong id="topReviewMovie">-</strong>
        <small>theo lượng đánh giá</small>
      </div>
      <div class="review-stat">
        <span class="stat-label">Cộng đồng</span>
        <strong id="positiveReviewStat">—</strong>
        <small id="positiveReviewCaption">chưa có đánh giá</small>
      </div>
    </div>
    <div class="home-review-grid" id="homeReviewGrid"></div>
  </section>

  <section class="newsletter container">
    <div>
      <p class="eyebrow">MovieVerse weekly</p>
      <h2>Đừng bỏ lỡ những thước phim hay.</h2>
      <p>Đăng ký quan tâm nhận tin về phim mới. Bạn có thể hủy đăng ký bằng email đã dùng; hiện chưa gửi email tự động.</p>
    </div>
    <form class="subscribe-form" id="subscribeForm">
      <label class="sr-only" for="email">Email của bạn</label>
      <input id="email" name="email" type="email" maxlength="254" autocomplete="email" placeholder="Email của bạn" required>
      <label class="subscribe-consent">
        <input type="checkbox" name="consent" required>
        <span>Tôi đồng ý lưu email để đăng ký nhận tin. <a href="/info.html#privacy">Quyền riêng tư</a></span>
      </label>
      <button type="submit">Đăng ký <span aria-hidden="true">→</span></button>
      <button type="button" class="newsletter-unsubscribe" id="unsubscribeNewsletter">Hủy đăng ký nhận tin</button>
      <p class="subscribe-status" id="subscribeStatus" role="status" aria-live="polite"></p>
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
updateNotificationCount();

try {
  renderGenrePills();
} catch (error) {
  console.error("Lỗi khi render genre pills:", error);
}

try {
  renderHero();
} catch (error) {
  console.error("Lỗi khi render hero:", error);
}

try {
  renderRecommendations();
} catch (error) {
  console.error("Lỗi khi render recommendations:", error);
}

const requestedGenre = new URLSearchParams(window.location.search).get("genre");
const selectedGenre = availableGenres.includes(requestedGenre)
  ? requestedGenre
  : "all";

try {
  renderMovies(selectedGenre);
} catch (error) {
  console.error("Lỗi khi render danh sách phim:", error);
}

if (selectedGenre !== "all") {
  requestAnimationFrame(() =>
    document.querySelector("#movies")?.scrollIntoView(),
  );
}

try {
  renderMovieCollectionRows();
} catch (error) {
  console.error("Lỗi khi hiển thị các hàng phim:", error);
}

try {
  renderRanking();
} catch (error) {
  console.error("Lỗi khi render bảng xếp hạng:", error);
}

document
  .querySelector("#rankFilter")
  ?.addEventListener("change", renderRanking);

try {
  renderNewMovies();
} catch (error) {
  console.error("Lỗi khi render phim mới:", error);
}

try {
  renderHomeReviews();
} catch (error) {
  console.error("Lỗi khi render đánh giá trang chủ:", error);
}

const newCountEl = document.querySelector("#newCount");
if (newCountEl) {
  newCountEl.textContent = `${newMovies.length} phim mới`;
}

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

const recForm = document.querySelector("#recommendationForm");
const recQuery = document.querySelector("#recommendationQuery");
const recClear = document.querySelector("#recommendationClear");

if (recForm && recQuery) {
  recForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderRecommendations(recQuery.value);
  });

  if (recClear) {
    recQuery.addEventListener("input", () => {
      recClear.style.display = recQuery.value.trim() ? "flex" : "none";
    });
    recClear.addEventListener("click", () => {
      recQuery.value = "";
      recClear.style.display = "none";
      recQuery.focus();
    });
  }

  document.querySelectorAll(".rec-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.query;
      recQuery.value = query;
      if (recClear) recClear.style.display = "flex";
      renderRecommendations(query);
    });
  });
}
document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );

document.querySelector("#subscribeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("#subscribeStatus");
  const button = form.querySelector('[type="submit"]');
  const email = new FormData(form).get("email");
  status.textContent = "Đang ghi nhận đăng ký...";
  status.classList.remove("is-error");
  button.disabled = true;

  try {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        consent: form.elements.consent.checked,
      }),
    });

    document
      .querySelector("#unsubscribeNewsletter")
      .addEventListener("click", async (event) => {
        const form = document.querySelector("#subscribeForm");
        const emailField = form.elements.email;
        if (!emailField.reportValidity()) return;

        const status = document.querySelector("#subscribeStatus");
        const button = event.currentTarget;
        status.textContent = "Đang cập nhật danh sách nhận tin...";
        status.classList.remove("is-error");
        button.disabled = true;

        try {
          const response = await fetch("/api/newsletter/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailField.value }),
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Không thể hủy đăng ký.");
          }
          status.textContent = result.message;
          emailField.value = "";
          form.elements.consent.checked = false;
        } catch (error) {
          status.textContent =
            error instanceof TypeError
              ? "Không kết nối được máy chủ. Vui lòng thử lại sau."
              : error.message;
          status.classList.add("is-error");
        } finally {
          button.disabled = false;
        }
      });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Không thể ghi nhận đăng ký.");
    }
    status.textContent = result.message;
    form.elements.email.value = "";
    form.elements.consent.checked = false;
  } catch (error) {
    status.textContent =
      error instanceof TypeError
        ? "Không kết nối được máy chủ. Vui lòng thử lại sau."
        : error.message;
    status.classList.add("is-error");
  } finally {
    button.disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSearch();
});

function posterStyle(movie) {
  return getPosterStyle(movie);
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
    .map((movie, index) => {
      const trailer = getTrailer(movie);
      const runtime = String(movie.runtime ?? "").trim();
      const mediaMarkup =
        trailer && trailer.kind === "file"
          ? `<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${movie.poster || movie.backdrop || ""}" src="${trailer.url}"></video>`
          : `<div class="hero-bg" style="background-image:url('${movie.backdrop || movie.poster}')"></div>`;

      return `<article class="hero-slide ${index === 0 ? "active" : ""}">${mediaMarkup}<div class="hero-copy"><span class="kicker">Phim nổi bật · ${movie.year}</span><h1>${movie.title}</h1><div class="hero-meta"><span>IMDb <strong>${movie.rating}</strong></span><span>${movie.genre}</span>${runtime ? `<span>${escapeHtml(runtime)}</span>` : ""}</div><p>${movie.description}</p><a class="watch-button" href="${detailUrl(movie)}"><span class="watch-button-icon" aria-hidden="true">▶</span><span>Xem chi tiết</span></a></div></article>`;
    })
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

function renderMovies(filter = "all", page = 1) {
  try {
    currentMoviePage = page;
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
    const totalPages = Math.ceil(shown.length / MOVIES_PER_PAGE);
    currentMoviePage = Math.max(1, Math.min(currentMoviePage, totalPages || 1));

    const startIndex = (currentMoviePage - 1) * MOVIES_PER_PAGE;
    const paginatedMovies = shown.slice(startIndex, startIndex + MOVIES_PER_PAGE);
    grid.innerHTML = shown.length
      ? paginatedMovies
          .map(
            (movie, index) =>
              `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" style="${posterStyle(movie)}" data-movie="${movie.title}" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${movie.title}"><span class="play-circle" aria-hidden="true">▶</span></a><div class="movie-card-info"><h3><a href="${detailUrl(movie)}">${movie.title}</a></h3><span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}/10</span></div><p>${movie.year} · ${movie.genre}</p></article>`,
          )
          .join("")
      : '<p class="empty-note">Chưa có phim thuộc thể loại này.</p>';
    bindDetailLinks("#movieGrid");
    let pagination = document.querySelector("#moviePagination");

    if (!pagination) {
      pagination = document.createElement("div");
      pagination.id = "moviePagination";
      pagination.style.cssText =
        "display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:28px 0;";
      grid.insertAdjacentElement("afterend", pagination);
    }

    pagination.innerHTML = totalPages > 1
      ? `
        <button ${currentMoviePage === 1 ? "disabled" : ""} data-page="${currentMoviePage - 1}">‹ Trước</button>
        ${Array.from({ length: totalPages }, (_, i) => `
          <button data-page="${i + 1}" ${currentMoviePage === i + 1 ? 'class="active"' : ""}>
            ${i + 1}
          </button>
        `).join("")}
        <button ${currentMoviePage === totalPages ? "disabled" : ""} data-page="${currentMoviePage + 1}">Sau ›</button>
      `
      : "";

    pagination.querySelectorAll("button[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        renderMovies(filter, Number(button.dataset.page));
      });
    });
  } catch (err) {
    console.error("Lỗi khi render danh sách phim:", err);
  }
}

function renderMovieCollectionRows() {
  const container = document.querySelector("#movieCollectionRows");
  if (!container) return;

  // Chỉ tạo hàng cho thể loại thực sự có trong kho phim.
  const categories = [
    { title: "Anime nổi bật", keywords: ["anime", "hoạt hình"] },
    { title: "Phim hành động", keywords: ["hành động"] },
    { title: "Phim viễn tưởng", keywords: ["viễn tưởng", "khoa học"] },
    { title: "Phim tình cảm", keywords: ["tình cảm", "lãng mạn"] },
  ];

  const normalize = (value) => String(value || "").toLocaleLowerCase("vi");
  container.innerHTML = categories.map(({ title, keywords }) => {
    const matches = movies.filter((movie) =>
      getMovieGenres(movie).some((genre) =>
        keywords.some((keyword) => normalize(genre).includes(keyword))
      )
    ).slice(0, 12);
    if (!matches.length) return "";
    return `
      <section class="movie-collection" aria-label="${title}">
        <div class="section-heading">
          <div><p class="eyebrow">Tuyển chọn cho bạn</p><h2>${title}</h2></div>
          <a class="text-link" href="/genres.html">Xem tất cả <span aria-hidden="true">→</span></a>
        </div>
        <div class="home-movie-rail" tabindex="0" aria-label="Cuộn ngang danh sách ${title}">
          ${matches.map((movie) => `
            <article class="movie-card">
              <a class="poster poster-link" style="${posterStyle(movie)}" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${escapeHtml(movie.title)}">
                <span class="play-circle" aria-hidden="true">▶</span>
              </a>
              <div class="movie-card-info">
                <h3><a href="${detailUrl(movie)}">${escapeHtml(movie.title)}</a></h3>
                <span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}/10</span>
              </div>
              <p>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</p>
            </article>`).join("")}
        </div>
      </section>`;
  }).join("");
}

function renderRecommendations(query = "") {
  const resultsBox = document.querySelector("#recommendationResults");
  const showMore = isMoreRecommendationsRequest(query);
  if (showMore && !previousRecommendationQuery.trim()) {
    resultsBox.innerHTML =
      '<p class="empty-note">Bạn hãy nhập thể loại hoặc tên một phim muốn xem trước nhé.</p>';
    return;
  }

  if (!showMore) {
    previousRecommendationQuery = query;
    displayedRecommendationIds.clear();
    resultsBox.innerHTML = "";
  }

  const results = rankMovieRecommendations({
    movies,
    reviews,
    favoriteIds: loadFavorites(),
    query: showMore ? previousRecommendationQuery : query,
    excludeMovieIds: [...displayedRecommendationIds],
  });
  if (!results.length) {
    resultsBox.insertAdjacentHTML(
      "beforeend",
      showMore
        ? '<p class="empty-note">Đã hiển thị hết phim phù hợp trong kho. Bạn thử thể loại khác nhé.</p>'
        : '<p class="empty-note">Chưa đủ dữ liệu để đưa ra gợi ý.</p>',
    );
    return;
  }

  const cards = results
    .map(({ movie, reasons }, index) => {
      displayedRecommendationIds.add(movie.id);
      return `
            <article class="recommendation-card" style="animation-delay:${index * 0.08}s">
              <a class="recommendation-poster" href="${detailUrl(movie)}" style="${getPosterStyle(movie)}" aria-label="Xem chi tiết ${escapeHtml(movie.title)}"></a>
              <div class="recommendation-card-copy">
                <p class="recommendation-reasons">${reasons.map(escapeHtml).join(" · ")}</p>
                <h3><a href="${detailUrl(movie)}">${escapeHtml(movie.title)}</a></h3>
                <p>${escapeHtml(movie.year)} · ★ ${getMovieReviewAverage(movie.title).toFixed(1)}/10</p>
              </div>
            </article>
          `;
    })
    .join("");
  resultsBox.insertAdjacentHTML("beforeend", cards);
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
    if (movie) node.href = detailUrl(movie);
  });
}

function getMovieReviewAverage(title) {
  const movie = movies.find((item) => item.title === title);
  return movie ? getMovieScoreOutOfTen(movie, reviews) : 0;
}

function renderRanking() {
  const periodFilter = document.querySelector("#rankFilter");
  const periodName = periodFilter.selectedOptions[0].textContent.toLocaleLowerCase(
    "vi",
  );
  const top = getMovieRanking(movies, reviews, periodFilter.value).slice(0, 6);
  document.querySelector("#rankingTitle").textContent =
    `Top phim ${periodName}`;
  document.querySelector("#rankingList").innerHTML = top.length
    ? top
        .map(
          ({ movie, score }, index) =>
            `<article class="rank-item"><span class="rank-number">0${index + 1}</span><a class="rank-poster" style="${posterStyle(movie)}" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${movie.title}"></a><div class="rank-info"><h3><a href="${detailUrl(movie)}">${movie.title}</a></h3><p>${movie.year} · ${movie.genre}</p></div><span class="rank-score">★ ${score.toFixed(1)}/10</span></article>`,
        )
        .join("")
    : '<p class="empty-note">Chưa có review trong khoảng thời gian này.</p>';
}

function renderNewMovies() {
  const grid = document.querySelector("#newMovieGrid");
  grid.innerHTML = newMovies.length
    ? newMovies
        .map(
          (movie, index) =>
            `<article class="movie-card" style="animation-delay:${index * 0.05}s"><a class="poster poster-link" style="${posterStyle(movie)}" data-movie="${movie.title}" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${movie.title}"><span class="play-circle" aria-hidden="true">▶</span></a><div class="movie-card-info"><h3><a href="${detailUrl(movie)}">${movie.title}</a></h3><span class="card-rating">★ ${getMovieReviewAverage(movie.title).toFixed(1)}/10</span></div><p>${movie.year} · ${movie.genre}</p></article>`,
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
    : "—";
  document.querySelector("#reviewCountStat").textContent =
    `${reviews.length} đánh giá`;
  const positiveRate = reviews.length
    ? Math.round(
        (reviews.filter((review) => Number(review.rating) >= 4).length /
          reviews.length) *
          100,
      )
    : null;
  document.querySelector("#positiveReviewStat").textContent =
    positiveRate === null ? "—" : `${positiveRate}%`;
  document.querySelector("#positiveReviewCaption").textContent =
    positiveRate === null ? "chưa có đánh giá" : "đánh giá 4–5 sao";
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
