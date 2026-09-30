import "./style.css";
import "./movie-detail.css";
import { getMovieDB } from "./data/data.js";
import {
  getMovieMedia,
  getMovieCredits,
  getSimilarMovies,
} from "./data/media.js";
import { addReview, deleteReview, getMovieReviews } from "./data/reviews.js";
import { isAdmin } from "./data/auth.js";
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
} from "./data/favorites.js";

const WATCHLIST_KEY = "movieverse_watchlist";

const movieList = getMovieDB();
const params = new URLSearchParams(window.location.search);
const movie = resolveMovie();

if (movie) {
  renderDetailPage(movie);
} else {
  renderNotFound();
}

function resolveMovie() {
  const id = params.get("id");
  const title = params.get("title");
  return (
    movieList.find((item) => item.id === id) ||
    movieList.find((item) => item.title === title) ||
    null
  );
}

function renderNotFound() {
  document.querySelector("#app").innerHTML = `
    <header class="site-header new-page-header">
      <div class="container nav-wrap">
        <a class="brand" href="/"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="main-nav" aria-label="Điều hướng chính">
          <a href="/">Trang chủ</a><a href="/new-movies.html">Phim mới</a><a href="/genres.html">Thể loại</a><a href="/reviews.html">Đánh giá</a><a href="/favorites.html">Yêu thích</a><a href="/ranking.html">Top phim</a>
        </nav>
        <div class="nav-actions"><a class="login-link" href="/">Về trang chủ →</a></div>
      </div>
    </header>
    <main class="detail-notfound">
      <div class="container">
        <p class="eyebrow">Lỗi 404</p>
        <h1>Không tìm thấy phim này</h1>
        <p>Bộ phim bạn tìm không còn tồn tại hoặc đã bị gỡ khỏi kho.</p>
        <a class="watch-button" href="/">← Quay về trang chủ</a>
      </div>
    </main>
  `;
}

function renderDetailPage(current) {
  const media = getMovieMedia(current, movieList);
  const credits = getMovieCredits(current);
  const similar = getSimilarMovies(current, movieList);
  const pageUrl = `${window.location.origin}/movie-detail.html?id=${encodeURIComponent(current.id)}`;
  const shareText = `Xem phim ${current.title} (${current.year}) trên MovieVerse`;

  document.querySelector("#app").innerHTML = `
    <header class="site-header new-page-header">
      <div class="container nav-wrap">
        <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="main-nav" aria-label="Điều hướng chính">
          <a href="/">Trang chủ</a><a href="/new-movies.html">Phim mới</a><a class="active" href="/genres.html" aria-current="page">Thể loại</a><a href="/reviews.html">Đánh giá</a><a href="/favorites.html">Yêu thích</a><a href="/ranking.html">Top phim</a>
        </nav>
        <div class="nav-actions">
          <a class="login-link" href="/new-movies.html">Phim mới <span aria-hidden="true">→</span></a>
          <button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>
        </div>
      </div>
    </header>

    <main class="detail-main">
      <section class="detail-hero" style="background-image:url('${current.backdrop}')">
        <div class="detail-hero-scrim"></div>
        <div class="container detail-hero-inner">
          <nav class="detail-breadcrumb" aria-label="Đường dẫn">
            <a href="/">Trang chủ</a><span aria-hidden="true">/</span>
            <a href="/?genre=${encodeURIComponent(current.genre)}">${current.genre}</a><span aria-hidden="true">/</span>
            <strong>${current.title}</strong>
          </nav>
          <div class="detail-hero-body">
            <div class="detail-poster" style="background-image:url('${current.poster}')" role="img" aria-label="Áp phích phim ${current.title}"></div>
            <div class="detail-hero-copy">
              <p class="eyebrow">${current.genre} · ${current.year}</p>
              <h1>${current.title}</h1>
              <p class="detail-summary">${current.description}</p>
              <div class="detail-metrics" id="detailMetrics"></div>
              <div class="detail-toolbar" role="toolbar" aria-label="Công cụ phim ${current.title}">
                    <button type="button" class="tb-btn tb-btn-primary" data-tool="play">▶ <span>Xem ngay</span></button>
                    <a class="tb-btn" href="/watch.html?id=${encodeURIComponent(current.id)}">⛶ <span>Xem phim</span></a>
                    <button type="button" class="tb-btn" data-tool="trailer">▷ <span>Trailer</span></button>
                <button type="button" class="tb-btn" data-tool="favorite" aria-pressed="false">♡ <span>Yêu thích</span></button>
                <button type="button" class="tb-btn" data-tool="watchlist" aria-pressed="false">＋ <span>Danh sách xem</span></button>
                <div class="tb-share">
                  <button type="button" class="tb-btn" data-tool="share" aria-expanded="false" aria-controls="toolbarSharePanel">↗ <span>Chia sẻ</span></button>
                  <div class="tb-share-menu" id="toolbarSharePanel" hidden>
                    <p class="tb-share-title">Chia sẻ phim này</p>
                    <div class="share-grid" data-share-scope="toolbar">
                      <button type="button" class="share-btn share-facebook" data-share="facebook"><span aria-hidden="true">f</span>Facebook</button>
                      <button type="button" class="share-btn share-tiktok" data-share="tiktok"><span aria-hidden="true">♪</span>TikTok</button>
                      <button type="button" class="share-btn share-instagram" data-share="instagram"><span aria-hidden="true">◎</span>Instagram</button>
                      <button type="button" class="share-btn share-copy" data-share="copy"><span aria-hidden="true">⎘</span>Sao chép link</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="container detail-layout">
        <div class="detail-primary">
          <section class="detail-block" id="detailVideo" aria-labelledby="playerHeading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Trailer phim</p>
                <h2 id="playerHeading">${media.main.title}</h2>
              </div>
              <span class="detail-video-meta" id="playerMeta"></span>
            </div>
            <div class="video-frame" id="videoFrame"></div>
            <div class="detail-video-foot">
              <p class="detail-video-note" id="playerNote"></p>
              <a class="video-watch-link" id="playerWatchLink" href="${media.main.watchUrl || "#"}" target="_blank" rel="noopener noreferrer" hidden>
                Mở trên YouTube <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>

          <section class="detail-block" id="relatedVideos" aria-labelledby="relatedHeading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Nguồn phát khác</p>
                <h2 id="relatedHeading">Cùng bộ phim này</h2>
              </div>
              <span class="detail-video-meta">${media.related.length} video</span>
            </div>
            <div class="video-list" id="relatedVideoList"></div>
          </section>

          <section class="detail-block" id="detailReviews" aria-labelledby="reviewsHeading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Góc nhìn cộng đồng</p>
                <h2 id="reviewsHeading">Đánh giá phim</h2>
              </div>
              <span class="detail-review-badge" id="reviewBadge"></span>
            </div>
            <div id="reviewSummary"></div>
            <form class="detail-review-form" id="detailReviewForm" novalidate>
              <div class="review-form-heading">
                <div>
                  <span class="review-form-kicker">Đã xem phim?</span>
                  <h3>Chia sẻ góc nhìn của bạn</h3>
                </div>
                <span class="review-form-note">Mất chưa đến 1 phút</span>
              </div>
              <div class="review-form-rating">
                <span class="review-field-label">Bạn chấm phim này thế nào?</span>
                <div class="star-input" id="detailStarInput" aria-label="Chọn số sao"></div>
              </div>
              <label class="sr-only" for="detailAuthor">Tên của bạn</label>
              <input id="detailAuthor" type="text" maxlength="30" placeholder="Tên hiển thị của bạn">
              <label class="sr-only" for="detailComment">Cảm nhận của bạn</label>
              <textarea id="detailComment" rows="3" placeholder="Điều gì khiến bạn nhớ nhất về bộ phim này?"></textarea>
              <div class="detail-review-foot">
                <p id="detailReviewHint" aria-live="polite"></p>
                <button type="submit" class="tb-btn tb-btn-primary">Đăng đánh giá <span aria-hidden="true">→</span></button>
              </div>
            </form>
            <div class="detail-review-list" id="detailReviewList"></div>
          </section>
        </div>

        <aside class="detail-aside">
          <section class="aside-card" aria-labelledby="infoHeading">
            <h3 id="infoHeading">Thông tin phim</h3>
            <dl class="info-list">
              <div><dt>Đạo diễn</dt><dd>${credits.director}</dd></div>
              <div><dt>Diễn viên</dt><dd>${credits.cast.join(", ")}</dd></div>
              <div><dt>Ngày phát hành</dt><dd>${credits.releaseDate}</dd></div>
              <div><dt>Thời lượng</dt><dd>${credits.runtime}</dd></div>
              <div><dt>Quốc gia</dt><dd>${credits.country}</dd></div>
              <div><dt>Ngôn ngữ</dt><dd>${credits.language}</dd></div>
              <div><dt>Đối tượng</dt><dd>${credits.ageRating}</dd></div>
              <div><dt>Hãng phim</dt><dd>${credits.studio}</dd></div>
            </dl>
          </section>

          <section class="aside-card" id="sharePanel" aria-labelledby="shareHeading">
            <h3 id="shareHeading">Chia sẻ phim</h3>
            <p class="aside-desc">Gửi bộ phim này đến bạn bè qua Facebook, TikTok hoặc Instagram.</p>
            <div class="share-grid" data-share-scope="panel">
              <button type="button" class="share-btn share-facebook" data-share="facebook"><span aria-hidden="true">f</span>Facebook</button>
              <button type="button" class="share-btn share-tiktok" data-share="tiktok"><span aria-hidden="true">♪</span>TikTok</button>
              <button type="button" class="share-btn share-instagram" data-share="instagram"><span aria-hidden="true">◎</span>Instagram</button>
              <button type="button" class="share-btn share-copy" data-share="copy"><span aria-hidden="true">⎘</span>Sao chép link</button>
            </div>
          </section>

          <section class="aside-card" aria-labelledby="similarHeading">
            <h3 id="similarHeading">Phim liên quan</h3>
            <div class="similar-list" id="similarList"></div>
          </section>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-bottom">
        <span>© 2024 MovieVerse. Made for movie lovers.</span>
        <a href="/">← Quay về MovieVerse</a>
      </div>
    </footer>

    <div class="detail-toast" id="detailToast" role="status" aria-live="polite"></div>
  `;

  const playerFrame = document.querySelector("#videoFrame");
  let selectedRating = 0;

  renderTrailer(media.main, true);
  renderMetrics();
  renderStarInput();
  renderReviews();
  renderRelatedVideos(media.related);
  renderSimilarMovies(similar);
  bindToolbar();
  bindShareButtons(pageUrl, shareText);
  bindMenuToggle();

  function renderMetrics() {
    const list = getMovieReviews(current.title);
    const average = list.length
      ? list.reduce((sum, review) => sum + Number(review.rating), 0) /
        list.length
      : Number(current.rating);

    document.querySelector("#detailMetrics").innerHTML = [
      `<span class="detail-score">★ ${average.toFixed(1)}</span>`,
      `<span>IMDb ${current.rating}</span>`,
      `<span>${credits.runtime}</span>`,
      `<span>${credits.ageRating}</span>`,
      `<span>${current.genre}</span>`,
    ].join("");
  }

  function renderTrailer(clip, isMain) {
    document.querySelector("#playerHeading").textContent = clip.title;
    document.querySelector("#playerMeta").textContent = clip.meta;

    const watchLink = document.querySelector("#playerWatchLink");
    watchLink.hidden = !clip.watchUrl;
    if (clip.watchUrl) watchLink.href = clip.watchUrl;

    document.querySelector("#playerNote").textContent = isMain
      ? clip.kind === "youtube"
        ? `Trailer chính thức của ${current.title}, phát trên kênh ${clip.meta}.`
        : `Kho phim chưa có trailer cho ${current.title}.`
      : `Đang xem ${clip.title} — cũng của ${current.title}. Nhấn "Trailer" trên thanh công cụ để quay lại trailer chính.`;

    if (clip.kind === "youtube") {
      playerFrame.innerHTML = `
        <iframe
          src="https://www.youtube-nocookie.com/embed/${clip.videoId}?rel=0&amp;modestbranding=1"
          title="${escapeHtml(clip.title)}"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>`;
    } else {
      playerFrame.innerHTML = `
        <div class="video-placeholder">
          <span class="video-placeholder-mark" aria-hidden="true">▶</span>
          <p>Chưa có trailer cho phim này</p>
        </div>`;
    }

    document
      .querySelectorAll("#relatedVideoList [data-clip]")
      .forEach((item) => {
        const isActive = !isMain && item.dataset.clip === clip.videoId;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
        item.closest(".video-item")?.classList.toggle("active", isActive);
      });
  }

  function renderRelatedVideos(related) {
    document.querySelector("#relatedVideoList").innerHTML =
      related
        .map(
          (clip, index) => `
        <article class="video-item" style="animation-delay:${index * 0.05}s">
          <button type="button" class="video-thumb" data-clip="${clip.videoId}" aria-label="Phát ${clip.title}">
            <span class="video-thumb-img" style="background-image:url('${clip.poster}')"></span>
            <span class="video-thumb-play" aria-hidden="true">▶</span>
            <span class="video-thumb-time">Trailer</span>
          </button>
          <div class="video-item-body">
            <h3>${clip.title}</h3>
            <p>${clip.movieTitle} · ${clip.meta}</p>
          </div>
        </article>`,
        )
        .join("") ||
      '<p class="empty-note">Phim này chỉ có một nguồn phát chính thức.</p>';

    document
      .querySelectorAll("#relatedVideoList [data-clip]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          const clip = related.find(
            (item) => item.videoId === button.dataset.clip,
          );
          if (!clip) return;
          renderTrailer(clip, false);
          scrollToPlayer();
        }),
      );
  }

  function renderSimilarMovies(list) {
    document.querySelector("#similarList").innerHTML = list.length
      ? list
          .map(
            (item) => `
            <a class="similar-item" href="/movie-detail.html?id=${encodeURIComponent(item.id)}">
              <span class="similar-poster" style="background-image:url('${item.poster}')"></span>
              <span class="similar-info">
                <strong>${item.title}</strong>
                <small>${item.year} · ${item.genre}</small>
              </span>
              <span class="similar-score">★ ${item.rating}</span>
            </a>`,
          )
          .join("")
      : '<p class="empty-note">Chưa có phim liên quan.</p>';
  }

  function safePlay() {
    const media = playerFrame.querySelector("video");
    if (!media) return;
    const result = media.play();
    if (result && typeof result.catch === "function") result.catch(() => {});
  }

  function scrollToPlayer() {
    document
      .querySelector("#detailVideo")
      .scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function bindToolbar() {
    const watchlist = loadWatchlist();
    const favorites = loadFavorites();
    const sharePanelEl = document.querySelector("#toolbarSharePanel");
    const shareTrigger = document.querySelector('[data-tool="share"]');
    const favoriteBtn = document.querySelector('[data-tool="favorite"]');
    const watchlistBtn = document.querySelector('[data-tool="watchlist"]');

    const syncState = () => {
      const favorite = favorites.includes(current.id);
      const saved = watchlist.includes(current.id);
      favoriteBtn.setAttribute("aria-pressed", String(favorite));
      favoriteBtn.classList.toggle("is-active", favorite);
      favoriteBtn.querySelector("span").textContent = favorite
        ? "Đã lưu"
        : "Yêu thích";
      watchlistBtn.setAttribute("aria-pressed", String(saved));
      watchlistBtn.classList.toggle("is-active", saved);
    };

    const toggleWatchlist = () => {
      const next = watchlist.includes(current.id)
        ? watchlist.filter((id) => id !== current.id)
        : [...watchlist, current.id];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      watchlist.length = 0;
      watchlist.push(...next);
      syncState();
      showToast(
        next.includes(current.id)
          ? `Đã thêm "${current.title}" vào danh sách xem.`
          : `Đã xoá "${current.title}" khỏi danh sách xem.`,
      );
    };

    const toggleFavorite = () => {
      const next = toggleFavoriteStorage(current.id);
      favorites.length = 0;
      favorites.push(...next);
      syncState();
      showToast(
        next.includes(current.id)
          ? `Đã thêm "${current.title}" vào yêu thích.`
          : `Đã bỏ "${current.title}" khỏi yêu thích.`,
      );
    };

    document
      .querySelector(".detail-toolbar")
      .addEventListener("click", (event) => {
        const button = event.target.closest("[data-tool]");
        if (!button) return;
        const tool = button.dataset.tool;

        if (tool === "play") {
          window.location.href = `/watch.html?id=${encodeURIComponent(current.id)}`;
          return;
        }
        if (tool === "trailer") {
          renderTrailer(media.main, true);
          scrollToPlayer();
        }
        if (tool === "favorite") toggleFavorite();
        if (tool === "watchlist") toggleWatchlist();
        if (tool === "share") {
          const isOpen = sharePanelEl.hasAttribute("hidden");
          sharePanelEl.toggleAttribute("hidden", !isOpen);
          shareTrigger.setAttribute("aria-expanded", String(isOpen));
        }
      });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".tb-share")) {
        sharePanelEl.setAttribute("hidden", "");
        shareTrigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        sharePanelEl.setAttribute("hidden", "");
        shareTrigger.setAttribute("aria-expanded", "false");
      }
    });

    syncState();
  }

  function renderStarInput() {
    const input = document.querySelector("#detailStarInput");
    input.innerHTML = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button type="button" class="star" data-star="${n}" aria-label="Chọn ${n} sao">★</button>`,
      )
      .join("");

    const stars = input.querySelectorAll(".star");
    const hint = document.querySelector("#detailReviewHint");

    const paint = (count) => {
      stars.forEach((star) =>
        star.classList.toggle("filled", Number(star.dataset.star) <= count),
      );
    };

    stars.forEach((star) =>
      star.addEventListener("mouseenter", () => {
        if (!selectedRating) paint(Number(star.dataset.star));
      }),
    );
    stars.forEach((star) =>
      star.addEventListener("click", () => {
        selectedRating = Number(star.dataset.star);
        paint(selectedRating);
        hint.textContent = `Bạn đã chấm ${selectedRating}/5 sao`;
        hint.style.color = "var(--accent)";
      }),
    );
    input.addEventListener("mouseleave", () => paint(selectedRating));
  }

  function renderReviews() {
    const list = getMovieReviews(current.title);
    const badge = document.querySelector("#reviewBadge");

    if (!list.length) {
      badge.textContent = "Chưa có đánh giá";
      document.querySelector("#reviewSummary").innerHTML = "";
    } else {
      const average =
        list.reduce((sum, review) => sum + Number(review.rating), 0) /
        list.length;
      const distribution = [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: list.filter((review) => Number(review.rating) === star).length,
      }));

      badge.textContent = `★ ${average.toFixed(1)}/5 · ${list.length} đánh giá`;
      document.querySelector("#reviewSummary").innerHTML = `
        <div class="review-overview">
          <div class="review-overview-score">
            <strong>${average.toFixed(1)}</strong>
            <div class="review-stars">${"★".repeat(Math.round(average))}${"☆".repeat(5 - Math.round(average))}</div>
            <small>${list.length} đánh giá từ cộng đồng</small>
          </div>
          <div class="review-bars">
            ${distribution
              .map(
                (row) => `
              <div class="review-bar">
                <span>${row.star} ★</span>
                <span class="review-bar-track"><span style="width:${(row.count / list.length) * 100}%"></span></span>
                <span class="review-bar-count">${row.count}</span>
              </div>`,
              )
              .join("")}
          </div>
        </div>`;
    }

    const sorted = [...list].sort((a, b) => {
      const dateA = new Date(String(a.date).split("/").reverse().join("-"));
      const dateB = new Date(String(b.date).split("/").reverse().join("-"));
      return dateB - dateA;
    });

    document.querySelector("#detailReviewList").innerHTML = sorted.length
      ? sorted
          .map(
            (review) => `
        <article class="review-item">
          <div class="review-avatar">${escapeHtml(review.author.charAt(0))}</div>
          <div class="review-body">
            <div class="review-top"><strong>${escapeHtml(review.author)}</strong><span class="review-date">${escapeHtml(review.date)}</span></div>
            <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p>${escapeHtml(review.comment)}</p>
            ${review.adminReply ? `<div class="detail-admin-reply"><strong>MovieVerse Admin</strong><p>${escapeHtml(review.adminReply.comment)}</p><small>${escapeHtml(review.adminReply.date)}</small></div>` : ""}
            <div class="detail-review-actions"><span></span>${isAdmin() ? `<button type="button" class="delete-review" data-delete-review="${escapeHtml(review.id)}">Xóa bình luận</button>` : ""}</div>
          </div>
        </article>`,
          )
          .join("")
      : '<p class="review-empty">Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên chia sẻ cảm nhận!</p>';
  }

  document
    .querySelector("#detailReviewForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const authorInput = document.querySelector("#detailAuthor");
      const commentInput = document.querySelector("#detailComment");
      const hint = document.querySelector("#detailReviewHint");
      const author = authorInput.value.trim();
      const comment = commentInput.value.trim();

      if (!selectedRating) {
        hint.textContent = "Hãy chọn số sao bạn muốn chấm.";
        hint.style.color = "#ff6b5c";
        return;
      }
      if (!author) {
        hint.textContent = "Hãy điền tên của bạn.";
        hint.style.color = "#ff6b5c";
        authorInput.focus();
        return;
      }
      if (!comment) {
        hint.textContent = "Hãy viết vài cảm nhận về phim.";
        hint.style.color = "#ff6b5c";
        commentInput.focus();
        return;
      }

      addReview({
        movieTitle: current.title,
        author,
        rating: selectedRating,
        comment,
      });

      event.target.reset();
      selectedRating = 0;
      document
        .querySelectorAll("#detailStarInput .star")
        .forEach((star) => star.classList.remove("filled"));
      hint.textContent = "Cảm ơn bạn, đánh giá đã được gửi!";
      hint.style.color = "var(--accent)";
      renderMetrics();
      renderReviews();
    });

  document
    .querySelector("#detailReviewList")
    .addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-delete-review]");
      if (!deleteButton || !isAdmin()) return;
      const review = getMovieReviews(current.title).find(
        (item) => item.id === deleteButton.dataset.deleteReview,
      );
      if (!review || !window.confirm(`Xóa bình luận của ${review.author}?`))
        return;
      deleteReview(review.id);
      renderMetrics();
      renderReviews();
    });
}

function bindShareButtons(pageUrl, shareText) {
  const PLATFORM_URLS = {
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    tiktok: "https://www.tiktok.com/",
    instagram: "https://www.instagram.com/",
  };

  document.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", async () => {
      const platform = button.dataset.share;

      if (
        platform === "copy" ||
        platform === "tiktok" ||
        platform === "instagram"
      ) {
        const copied = await copyText(`${shareText} — ${pageUrl}`);
        if (platform === "copy") {
          showToast(
            copied
              ? "Đã sao chép link phim."
              : "Không sao chép được, hãy copy từ thany địa chỉ.",
          );
          return;
        }
        const label = platform === "tiktok" ? "TikTok" : "Instagram";
        showToast(
          copied
            ? `Đã sao chép link — dán vào bài đăng ${label} của bạn.`
            : `Mở ${label} để chia sẻ phim này.`,
        );
        window.open(PLATFORM_URLS[platform], "_blank", "noopener");
        return;
      }

      const shareUrl = `${PLATFORM_URLS.facebook}${encodeURIComponent(pageUrl)}`;
      window.open(shareUrl, "facebook-share", "width=640,height=560");
    });
  });
}

function bindMenuToggle() {
  const menuToggle = document.querySelector(".menu-toggle");
  if (!menuToggle) return;
  menuToggle.addEventListener("click", () => {
    const isOpen = document
      .querySelector(".main-nav")
      .classList.toggle("mobile-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return [];
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch (_) {
    return false;
  }
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#detailToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
