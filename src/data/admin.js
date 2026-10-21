import "../admin/admin.css";
import {
  getMovieDB,
  remoteMovieCatalogInitialized,
  getGenreList,
  getMovieGenres,
  initializeCatalog,
  saveSharedCatalog,
} from "./data.js";
import { getSession, isAdmin } from "./auth.js";
import { getTrailer } from "./media.js";
import {
  deleteReview,
  loadReviews,
  setReviewHidden,
  syncReviews,
} from "./reviews.js";
import {
  isValidMediaUrl,
  isValidReleaseYear,
} from "./movie-validation.js";

if (!isAdmin()) {
  window.location.replace("/login.html?next=/admin/admin.html");
}

await initializeCatalog();

const currentYear = new Date().getFullYear();
try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

const DB_KEY = "movieverse_db";
let movies = loadDB();

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.movies)) {
        return parsed.movies;
      }
    } catch (_) {}
  }
  return getMovieDB();
}

async function persist(nextMovies) {
  await saveSharedCatalog(nextMovies, getGenreList());
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let currentFilter = "all";
let currentQuery = "";
let editingId = null;
let deleteId = null;
let reviewQuery = "";
let reviews = loadReviews();
let ratingLookupTimer;
let ratingLookupController;
let movieSearchTimer;
let movieSearchController;
let ratingManuallyEdited = false;
let selectedRatingSource = null;

document.querySelector("#app").innerHTML = `
<header class="admin-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
    <nav class="admin-nav" aria-label="Điều hướng quản trị">
      <a href="/" class="back-link">← Trang chủ</a>
      <a class="active" href="/admin/admin.html">Quản lý phim</a>
      <a href="/admin/schedule.html">Lịch phát hành</a>
      <a href="/admin/genres.html">Thể loại</a>
      <a href="/admin/comments.html">Bình luận</a>
      <a href="/admin/users.html">Người dùng</a>
    </nav>
    <div class="header-actions">
      <button class="btn btn-primary" id="addMovieBtn">+ Thêm phim</button>
    </div>

  </div>
</header>

<main class="admin-main">
  <div class="container">
    <div class="admin-heading">
      <div>
        <p class="eyebrow">Quản trị</p>
        <h1>Quản lý phim</h1>
        <p>Thêm, chỉnh sửa và sắp xếp kho phim của MovieVerse.</p>
      </div>
    </div>

    <div class="stats-grid" id="statsGrid"></div>
    <section class="admin-panel review-moderation" aria-label="Quản lý bình luận">
      <div class="review-moderation-heading"><h2>Quản lý bình luận</h2><p>Ẩn hoặc hiện bình luận của người dùng.</p></div>
      <div class="table-wrap"><table class="movie-table"><thead><tr><th>Người dùng</th><th>Phim</th><th>Bình luận</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody id="reviewTableBody"></tbody></table></div>
    </section>

    <div class="admin-panel">
      <div class="panel-toolbar">
        <input class="toolbar-input" id="searchInput" type="search" placeholder="Tìm theo tên phim...">
        <select class="toolbar-select" id="genreFilter" aria-label="Lọc theo thể loại"></select>
      </div>
      <div class="table-wrap">
        <table class="movie-table movie-inventory-table">
          <thead>
            <tr>
              <th>Phim</th>
              <th>Thể loại</th>
              <th>Năm</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th style="text-align:right">Hành động</th>
            </tr>
          </thead>
          <tbody id="movieTableBody"></tbody>
        </table>
      </div>
    </div>

    <section class="admin-panel comment-admin-panel" aria-labelledby="commentAdminTitle">
      <div class="comment-admin-head">
        <div>
          <p class="eyebrow">Kiểm duyệt cộng đồng</p>
          <h2 id="commentAdminTitle">Quản lý bình luận</h2>
        </div>
        <span class="comment-admin-count" id="commentAdminCount"></span>
      </div>
      <div class="panel-toolbar">
        <input class="toolbar-input" id="commentSearchInput" type="search" placeholder="Tìm theo phim hoặc người dùng...">
      </div>
      <div class="table-wrap">
        <table class="movie-table comment-table">
          <thead><tr><th>Người dùng</th><th>Phim</th><th>Đánh giá</th><th>Bình luận</th><th>Ngày</th><th style="text-align:right">Hành động</th></tr></thead>
          <tbody id="commentTableBody"></tbody>
        </table>
      </div>
    </section>
  </div>
</main>

<footer class="admin-footer">
  <div class="container">
    <span>© 2024 MovieVerse Admin.</span><span>Quản lý kho phim</span>
  </div>
</footer>

<div class="overlay" id="formOverlay" aria-hidden="true">
  <div class="form-card">
    <div class="form-head">
      <h2 id="formTitle">Thêm phim mới</h2>
      <button class="close-btn" data-close="formOverlay" aria-label="Đóng">×</button>
    </div>
    <form id="movieForm" novalidate>
      <div class="form-body">
        <input type="hidden" id="fieldId">
        <div class="form-grid">
          <div class="field full">
            <label for="fieldTitle">Tên phim *</label>
            <input id="fieldTitle" type="text" placeholder="Nhập tên phim, rồi chọn kết quả phù hợp nếu muốn" required>
          </div>
          <div class="field full movie-search-field" id="movieSearchField" hidden>
            <label>Kết quả tìm phim trên TMDb</label>
            <div class="related-movie-list" id="movieSearchList" role="listbox" aria-label="Kết quả tìm phim"></div>
            <small class="field-hint" id="movieSearchStatus" aria-live="polite"></small>
          </div>
          <div class="field">
            <label for="fieldYear">Năm phát hành</label>
            <input id="fieldYear" type="number" min="1900" max="${currentYear}" placeholder="${currentYear}" aria-describedby="fieldYearError">
            <small class="field-error" id="fieldYearError" aria-live="polite"></small>
          </div>
          <div class="field">
            <label for="fieldRating">Đánh giá (0 - 10)</label>
            <input id="fieldRating" type="number" min="0" max="10" step="0.1" placeholder="8.5">
            <small class="field-hint" id="ratingLookupStatus" aria-live="polite">Nhập tên phim để tự điền thông tin từ OMDb. Trailer được bổ sung từ TMDb nếu có API key và ô còn trống; link tập phim giữ nguyên.</small>
          </div>
          <div class="field">
            <label for="fieldReleaseDate">Ngày phát hành</label>
            <input id="fieldReleaseDate" type="text" placeholder="VD: 10 Mar 2024">
          </div>
          <div class="field">
            <label for="fieldRuntime">Thời lượng</label>
            <input id="fieldRuntime" type="text" placeholder="VD: 142 min">
          </div>
          <div class="field">
            <label for="fieldLanguage">Ngôn ngữ</label>
            <input id="fieldLanguage" type="text" placeholder="VD: English, French">
          </div>
          <div class="field">
            <label for="fieldAgeRating">Phân loại độ tuổi</label>
            <input id="fieldAgeRating" type="text" placeholder="VD: PG-13">
          </div>
          <div class="field">
            <label for="fieldGenre">Thể loại (có thể chọn nhiều)</label>
            <select id="fieldGenre" multiple size="5"></select>
          </div>
          <div class="field checkbox-field">
            <input id="fieldIsNew" type="checkbox">
            <label for="fieldIsNew" style="margin:0">Đánh dấu là phim mới</label>
          </div>
          <div class="field full">
            <label for="fieldPoster">URL ảnh poster</label>
            <input id="fieldPoster" type="url" placeholder="https://...">
          </div>
          <div class="field full">
            <label for="fieldBackdrop">URL ảnh nền (backdrop)</label>
            <input id="fieldBackdrop" type="url" placeholder="https://...">
          </div>
          <div class="field full">
            <label for="fieldTrailerUrl">URL trailer</label>
            <input id="fieldTrailerUrl" type="url" placeholder="YouTube hoặc video MP4 (https://...)">
            <small class="field-hint">Trailer tự điền khi tìm được từ TMDb hoặc thư viện MovieVerse; nếu chưa có, dán link trailer tại đây.</small>
          </div>
          <div class="field full">
            <label for="fieldMovieUrl">URL phim / tập 1</label>
            <input id="fieldMovieUrl" type="url" placeholder="Link phát hợp pháp trên YouTube hoặc MP4 (https://...)" aria-describedby="movieUrlHint">
            <small class="field-hint" id="movieUrlHint">Nhập link phim lẻ hoặc tập 1 của phim bộ. Trailer được nhập riêng ở ô phía trên.</small>
          </div>
          <div class="field full">
            <label for="fieldEpisodes">URL các tập tiếp theo</label>
            <textarea id="fieldEpisodes" rows="4" placeholder="Mỗi dòng là một tập, theo thứ tự phát&#10;https://..."></textarea>
            <small class="field-hint">Chỉ dùng cho phim bộ; mỗi dòng là một tập sau tập đầu tiên.</small>
          </div>
          <div class="field full">
            <label for="fieldDescription">Mô tả</label>
            <textarea id="fieldDescription" placeholder="Tóm tắt nội dung phim..."></textarea>
          </div>
          <div class="field full">
            <label for="fieldCountry">Quốc gia</label>
            <input id="fieldCountry" type="text" placeholder="VD: Hoa Kỳ, Canada">
          </div>
          <div class="field full">
            <label for="fieldDirector">Đạo diễn</label>
            <input id="fieldDirector" type="text" placeholder="VD: Denis Villeneuve">
          </div>
          <div class="field full">
            <label for="fieldCast">Diễn viên (cách nhau bằng dấu phẩy)</label>
            <input id="fieldCast" type="text" placeholder="VD: Timothée Chalamet, Zendaya">
          </div>
          <div class="field full">
            <label for="fieldWriters">Biên kịch / tác giả (cách nhau bằng dấu phẩy)</label>
            <input id="fieldWriters" type="text" placeholder="VD: Jon Spaihts, Denis Villeneuve">
          </div>
          <div class="field full">
            <label for="fieldProducers">Nhà sản xuất (cách nhau bằng dấu phẩy)</label>
            <input id="fieldProducers" type="text" placeholder="VD: Mary Parent, Denis Villeneuve">
          </div>
          <div class="field full">
            <label for="fieldStudio">Hãng phim / đơn vị sản xuất</label>
            <input id="fieldStudio" type="text" placeholder="VD: Warner Bros. Pictures">
          </div>
          <div class="field full">
            <label for="fieldAwards">Giải thưởng</label>
            <input id="fieldAwards" type="text" placeholder="VD: 2 giải Oscar, 5 đề cử">
          </div>
          <div class="field">
            <label for="fieldBoxOffice">Doanh thu phòng vé</label>
            <input id="fieldBoxOffice" type="text" placeholder="VD: $711,844,358">
          </div>
          <div class="field">
            <label for="fieldOfficialWebsite">Website chính thức</label>
            <input id="fieldOfficialWebsite" type="url" placeholder="https://...">
          </div>
          <div class="field full">
            <label for="fieldCinematographers">Quay phim (cách nhau bằng dấu phẩy)</label>
            <input id="fieldCinematographers" type="text" placeholder="VD: Greig Fraser">
          </div>
          <div class="field full">
            <label for="fieldComposers">Âm nhạc (cách nhau bằng dấu phẩy)</label>
            <input id="fieldComposers" type="text" placeholder="VD: Hans Zimmer">
          </div>
        </div>
        <p class="form-note">* là trường bắt buộc. Thông tin, trailer và link phát phim được lưu trên máy chủ. Muốn tự lấy trailer mới, cấu hình TMDB_API_KEY trong .env.</p>
      </div>
      <div class="form-foot">
        <button type="button" class="btn btn-ghost" data-close="formOverlay">Hủy</button>
        <button type="submit" class="btn btn-primary">Lưu phim</button>
      </div>
    </form>
  </div>
</div>

<div class="overlay" id="deleteOverlay" aria-hidden="true">
  <div class="confirm-card">
    <div class="confirm-icon">!</div>
    <h3>Xóa phim?</h3>
    <p id="deleteMessage">Bạn có chắc muốn xóa phim này không?</p>
    <div class="confirm-actions">
      <button class="btn btn-ghost" data-close="deleteOverlay">Hủy</button>
      <button class="btn btn-danger" id="confirmDeleteBtn">Xóa</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
`;

if (!remoteMovieCatalogInitialized && getSession()?.adminToken) {
  try {
    await persist(movies);
  } catch (error) {
    console.error("Không thể khởi tạo kho phim trên máy chủ:", error);
  }
}

init();

function init() {
  fillGenreSelects();
  bindEvents();
  renderAll();
}

function fillGenreSelects() {
  const genres = [
    ...new Set([...getGenreList(), ...movies.flatMap(getMovieGenres)]),
  ];
  const filter = document.querySelector("#genreFilter");
  filter.innerHTML =
    `<option value="all">Tất cả thể loại</option>` +
    genres
      .map(
        (genre) =>
          `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`,
      )
      .join("");

  const field = document.querySelector("#fieldGenre");
  field.innerHTML = genres
    .map(
      (genre) =>
        `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`,
    )
    .join("");
}

function bindEvents() {
  document.querySelector("#addMovieBtn").addEventListener("click", openAddForm);
  document.querySelector("#movieForm").addEventListener("submit", onSave);
  document.querySelector("#fieldTitle").addEventListener("input", () => {
    hideMovieSearchResults();
    const title = document.querySelector("#fieldTitle").value.trim();
    const originalTitle = editingId
      ? movies.find((movie) => movie.id === editingId)?.title
      : selectedRatingSource?.title;
    if (
      originalTitle &&
      originalTitle !== title &&
      !ratingManuallyEdited
    ) {
      document.querySelector("#fieldRating").value = "";
    }
    if (selectedRatingSource && selectedRatingSource.title !== title) {
      selectedRatingSource = null;
    }
    scheduleMovieSearch();
    scheduleRatingLookup();
  });
  document.querySelector("#movieSearchList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-search-title]");
    if (!button) return;
    const titleInput = document.querySelector("#fieldTitle");
    titleInput.value = button.dataset.searchTitle;
    titleInput.dispatchEvent(new Event("input", { bubbles: true }));
    clearTimeout(movieSearchTimer);
    movieSearchController?.abort();
    clearTimeout(ratingLookupTimer);
    hideMovieSearchResults();
    lookupMovieDetails(titleInput.value);
    titleInput.focus();
  });
  document.querySelector("#fieldRating").addEventListener("input", () => {
    ratingManuallyEdited = true;
    selectedRatingSource = null;
    clearTimeout(ratingLookupTimer);
    ratingLookupController?.abort();
    setRatingLookupStatus("Bạn đang nhập rating thủ công.");
  });
  document.querySelector("#fieldYear").addEventListener("input", (event) => {
    const input = event.currentTarget;
    showYearError(
      input.validity.rangeOverflow
        ? `Năm phát hành không được vượt quá ${currentYear}.`
        : input.validity.rangeUnderflow
          ? "Năm phát hành không được nhỏ hơn 1900."
          : "",
    );
  });
  document.querySelector("#fieldYear").addEventListener("blur", (event) => {
    const input = event.currentTarget;
    if (!input.validity.rangeOverflow && !input.validity.rangeUnderflow) return;

    const message = input.validity.rangeOverflow
      ? `Năm phát hành không được vượt quá ${currentYear}.`
      : "Năm phát hành không được nhỏ hơn 1900.";
    input.value = "";
    showYearError(message);
  });
  document
    .querySelector("#confirmDeleteBtn")
    .addEventListener("click", onDelete);
  document.querySelector("#searchInput").addEventListener("input", (event) => {
    currentQuery = event.target.value;
    renderTable();
  });
  document.querySelector("#genreFilter").addEventListener("change", (event) => {
    currentFilter = event.target.value;
    renderAll();
  });
  document
    .querySelector("#commentSearchInput")
    .addEventListener("input", (event) => {
      reviewQuery = event.target.value;
      renderComments();
    });
  document
    .querySelectorAll("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        closeOverlay(button.dataset.close),
      ),
    );
  document.querySelectorAll(".overlay").forEach((overlay) =>
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlay(overlay.id);
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOverlay("formOverlay");
      closeOverlay("deleteOverlay");
    }
  });
}

function renderAll() {
  renderStats();
  renderTable();
  renderReviewTable();
  renderComments();
}

function renderComments() {
  const query = reviewQuery.trim().toLocaleLowerCase("vi");
  const shown = reviews.filter(
    (review) =>
      !query ||
      `${review.author} ${review.movieTitle} ${review.comment}`
        .toLocaleLowerCase("vi")
        .includes(query),
  );
  document.querySelector("#commentAdminCount").textContent =
    `${shown.length}/${reviews.length} bình luận`;
  document.querySelector("#commentTableBody").innerHTML = shown.length
    ? shown
        .map(
          (review) =>
            `<tr><td><strong>${escapeHtml(review.author)}</strong></td><td>${escapeHtml(review.movieTitle)}</td><td><span class="badge rating">★ ${review.rating}/5</span></td><td class="comment-table-text">${escapeHtml(review.comment)}</td><td>${escapeHtml(review.date)}</td><td><div class="row-actions"><button class="btn btn-danger btn-sm" data-delete-comment="${escapeHtml(review.id)}">Xóa</button></div></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="6"><div class="empty-state"><h3>Không tìm thấy bình luận</h3><p>Thử thay đổi từ khóa tìm kiếm.</p></div></td></tr>`;
  document.querySelectorAll("[data-delete-comment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const review = reviews.find(
        (item) => item.id === button.dataset.deleteComment,
      );
      if (!review || !window.confirm(`Xóa bình luận của ${review.author}?`))
        return;
      try {
        await deleteReview(review.id);
      } catch (error) {
        showToast(error.message, "error");
        return;
      }
      reviews = loadReviews();
      renderComments();
      showToast("Đã xóa bình luận.", "success");
    });
  });
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function renderStats() {
  const total = movies.length;
  const avg =
    total > 0
      ? movies.reduce((sum, movie) => sum + Number(movie.rating) || 0, 0) /
        total
      : 0;
  const genreCount = new Set(movies.flatMap(getMovieGenres)).size;
  const newCount = movies.filter((movie) => movie.isNew).length;

  document.querySelector("#statsGrid").innerHTML = `
    <div class="stat-card"><div class="stat-label">Tổng số phim</div><div class="stat-value">${total}</div><div class="stat-sub">trong kho phim</div></div>
    <div class="stat-card"><div class="stat-label">Điểm trung bình</div><div class="stat-value gold">${avg.toFixed(1)}</div><div class="stat-sub">trên 10</div></div>
    <div class="stat-card"><div class="stat-label">Thể loại</div><div class="stat-value accent">${genreCount}</div><div class="stat-sub">đang phát hành</div></div>
    <div class="stat-card"><div class="stat-label">Phim mới</div><div class="stat-value">${newCount}</div><div class="stat-sub">vừa cập nhật</div></div>
  `;
}

function filteredMovies() {
  const query = currentQuery.trim().toLowerCase();
  return movies.filter((movie) => {
    const matchGenre =
      currentFilter === "all" || getMovieGenres(movie).includes(currentFilter);
    const matchQuery = !query || movie.title.toLowerCase().includes(query);
    return matchGenre && matchQuery;
  });
}

function renderTable() {
  const shown = filteredMovies();
  const body = document.querySelector("#movieTableBody");

  if (!shown.length) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h3>Không tìm thấy phim</h3><p>Thử thay đổi từ khóa hoặc thêm phim mới.</p></div></td></tr>`;
    return;
  }

  body.innerHTML = shown
    .map(
      (movie) => `
        <tr>
          <td>
            <div class="movie-cell">
              <div class="movie-thumb" style="background-image:url('${movie.poster}')"></div>
              <span class="movie-title" title="${movie.title}">${movie.title}</span>
            </div>
          </td>
          <td><span class="badge genre">${escapeHtml(movie.genre)}</span></td>
          <td>${movie.year}</td>
          <td><span class="badge rating">★ ${movie.rating}</span></td>
          <td>${movie.isNew ? '<span class="badge new">Mới</span>' : '<span class="badge old">Cũ</span>'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost btn-sm" data-edit="${movie.id}">Sửa</button>
              <button class="btn btn-danger btn-sm" data-delete="${movie.id}">Xóa</button>
            </div>
          </td>
        </tr>`,
    )
    .join("");

  body
    .querySelectorAll("[data-edit]")
    .forEach((button) =>
      button.addEventListener("click", () => openEditForm(button.dataset.edit)),
    );
  body
    .querySelectorAll("[data-delete]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openDeleteConfirm(button.dataset.delete),
      ),
    );
}

function openAddForm() {
  clearTimeout(ratingLookupTimer);
  ratingLookupController?.abort();
  editingId = null;
  ratingManuallyEdited = false;
  selectedRatingSource = null;
  document.querySelector("#formTitle").textContent = "Thêm phim mới";
  document.querySelector("#movieForm").reset();
  hideMovieSearchResults();
  setRatingLookupStatus("Nhập tên phim để tự điền thông tin tìm được từ OMDb. Trailer và tập phim không bị thay đổi.");
  document.querySelector("#fieldId").value = "";
  document.querySelector("#fieldYear").value = String(currentYear);
  showYearError("");
  [...document.querySelector("#fieldGenre").options].forEach((option) => {
    option.selected = option.value === "Hành động";
  });
  document.querySelector("#fieldIsNew").checked = true;
  openOverlay("formOverlay");
  document.querySelector("#fieldTitle").focus();
}

function openEditForm(id) {
  const movie = movies.find((item) => item.id === id);
  if (!movie) return;
  clearTimeout(ratingLookupTimer);
  ratingLookupController?.abort();
  editingId = id;
  ratingManuallyEdited = false;
  hideMovieSearchResults();
  selectedRatingSource = movie.ratingSource || null;
  document.querySelector("#formTitle").textContent = "Chỉnh sửa phim";
  document.querySelector("#fieldId").value = movie.id;
  document.querySelector("#fieldTitle").value = movie.title;
  document.querySelector("#fieldYear").value = movie.year || "";
  document.querySelector("#fieldReleaseDate").value = movie.releaseDate || "";
  document.querySelector("#fieldRuntime").value = movie.runtime || "";
  document.querySelector("#fieldLanguage").value = movie.language || "";
  document.querySelector("#fieldAgeRating").value = movie.ageRating || "";
  showYearError("");
  document.querySelector("#fieldRating").value = movie.rating || "";
  setRatingLookupStatus(
    selectedRatingSource
      ? `Rating lưu từ ${selectedRatingSource.name}.`
      : "Chỉnh sửa rating thủ công nếu cần.",
  );
  const selectedGenres = getMovieGenres(movie);
  [...document.querySelector("#fieldGenre").options].forEach((option) => {
    option.selected = selectedGenres.includes(option.value);
  });
  document.querySelector("#fieldIsNew").checked = Boolean(movie.isNew);
  document.querySelector("#fieldPoster").value = movie.poster || "";
  document.querySelector("#fieldBackdrop").value = movie.backdrop || "";
  document.querySelector("#fieldTrailerUrl").value = movie.trailerUrl || "";
  const episodeUrls = Array.isArray(movie.episodes) ? movie.episodes : [];
  const hasSeparateMovieUrl = Boolean(movie.movieUrl);
  document.querySelector("#fieldMovieUrl").value =
    movie.movieUrl || episodeUrls[0] || "";
  document.querySelector("#fieldEpisodes").value = (hasSeparateMovieUrl
    ? episodeUrls
    : episodeUrls.slice(1)
  ).join("\n");
  document.querySelector("#fieldDescription").value = movie.description || "";
  document.querySelector("#fieldCountry").value = movie.country || "";
  document.querySelector("#fieldDirector").value = movie.director || "";
  document.querySelector("#fieldCast").value = formatNames(movie.cast);
  document.querySelector("#fieldWriters").value = formatNames(movie.writers);
  document.querySelector("#fieldProducers").value = formatNames(movie.producers);
  document.querySelector("#fieldStudio").value = formatNames(
    movie.productionCompanies,
  );
  document.querySelector("#fieldAwards").value = movie.awards || "";
  document.querySelector("#fieldBoxOffice").value = movie.boxOffice || "";
  document.querySelector("#fieldOfficialWebsite").value =
    movie.officialWebsite || "";
  document.querySelector("#fieldCinematographers").value = formatNames(
    movie.cinematographers,
  );
  document.querySelector("#fieldComposers").value = formatNames(
    movie.composers,
  );
  openOverlay("formOverlay");
  document.querySelector("#fieldTitle").focus();
}

async function onSave(event) {
  event.preventDefault();
  const form = document.querySelector("#movieForm");
  const title = document.querySelector("#fieldTitle").value.trim();
  const yearInput = document.querySelector("#fieldYear");
  const year = yearInput.value.trim() || String(currentYear);
  if (!title) {
    showToast("Vui lòng nhập tên phim.", "error");
    document.querySelector("#fieldTitle").focus();
    return;
  }
  if (!isValidReleaseYear(year, currentYear)) {
    showYearError(`Năm phát hành phải từ 1900 đến ${currentYear}.`);
    yearInput.focus();
    return;
  }
  showYearError("");

  const trailerUrl = document.querySelector("#fieldTrailerUrl").value.trim();
  const movieUrl = document.querySelector("#fieldMovieUrl").value.trim();
  const additionalEpisodeUrls = document
    .querySelector("#fieldEpisodes")
    .value.split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  const officialWebsite = document
    .querySelector("#fieldOfficialWebsite")
    .value.trim();
  const invalidMediaUrl = [
    trailerUrl,
    movieUrl,
    ...additionalEpisodeUrls,
  ].find(
    (url) => url && !isValidMediaUrl(url),
  );
  if (invalidMediaUrl) {
    showToast("Link trailer và tập phim phải là URL bắt đầu bằng http:// hoặc https://.", "error");
    document
      .querySelector(
        trailerUrl && !isValidMediaUrl(trailerUrl)
          ? "#fieldTrailerUrl"
          : movieUrl && !isValidMediaUrl(movieUrl)
            ? "#fieldMovieUrl"
            : "#fieldEpisodes",
      )
      .focus();
    return;
  }
  if (officialWebsite && !isValidMediaUrl(officialWebsite)) {
    showToast("Website chính thức phải là URL bắt đầu bằng http:// hoặc https://.", "error");
    document.querySelector("#fieldOfficialWebsite").focus();
    return;
  }

  const movie = {
    id: editingId || document.querySelector("#fieldId").value || uid(),
    title,
    year,
    releaseDate: document.querySelector("#fieldReleaseDate").value.trim(),
    runtime: document.querySelector("#fieldRuntime").value.trim(),
    language: document.querySelector("#fieldLanguage").value.trim(),
    ageRating: document.querySelector("#fieldAgeRating").value.trim(),
    episodeCount: movies.find((item) => item.id === editingId)?.episodeCount,
    genre: [...document.querySelector("#fieldGenre").selectedOptions]
      .map((option) => option.value)
      .join(", "),
    rating: document.querySelector("#fieldRating").value.trim() || "8.0",
    isNew: document.querySelector("#fieldIsNew").checked,
    poster:
      document.querySelector("#fieldPoster").value.trim() ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=85",
    backdrop:
      document.querySelector("#fieldBackdrop").value.trim() ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&q=85",
    trailerUrl,
    movieUrl,
    episodes: additionalEpisodeUrls,
    description:
      document.querySelector("#fieldDescription").value.trim() ||
      "Chưa có mô tả cho phim này.",
    country: document.querySelector("#fieldCountry").value.trim(),
    director: document.querySelector("#fieldDirector").value.trim(),
    cast: parseNames(document.querySelector("#fieldCast").value),
    writers: parseNames(document.querySelector("#fieldWriters").value),
    producers: parseNames(document.querySelector("#fieldProducers").value),
    productionCompanies: parseNames(
      document.querySelector("#fieldStudio").value,
    ),
    awards: document.querySelector("#fieldAwards").value.trim(),
    boxOffice: document.querySelector("#fieldBoxOffice").value.trim(),
    officialWebsite,
    cinematographers: parseNames(
      document.querySelector("#fieldCinematographers").value,
    ),
    composers: parseNames(document.querySelector("#fieldComposers").value),
    ratingSource: selectedRatingSource,
  };

  const nextMovies = [...movies];
  const index = nextMovies.findIndex((item) => item.id === movie.id);
  if (index === -1) {
    nextMovies.unshift(movie);
  } else {
    nextMovies[index] = movie;
  }

  try {
    await persist(nextMovies);
  } catch (error) {
    showToast(error.message, "error");
    return;
  }
  movies = nextMovies;
  closeOverlay("formOverlay");
  renderAll();
  form.reset();
  showToast(
    index === -1
      ? `Đã thêm "${movie.title}".`
      : `Đã cập nhật "${movie.title}".`,
    "success",
  );
}

function setRatingLookupStatus(message, state = "") {
  const status = document.querySelector("#ratingLookupStatus");
  status.textContent = message;
  status.classList.toggle("is-error", state === "error");
}

function scheduleRatingLookup() {
  clearTimeout(ratingLookupTimer);
  ratingLookupController?.abort();
  const title = document.querySelector("#fieldTitle").value.trim();
  if (title.length < 2) {
    setRatingLookupStatus("Nhập tên phim để tự điền thông tin từ OMDb. Trailer được bổ sung từ TMDb nếu có API key và ô còn trống.");
    return;
  }
  setRatingLookupStatus("Đang chờ nhập tên phim...");
  ratingLookupTimer = setTimeout(() => lookupMovieDetails(title), 650);
}

function scheduleMovieSearch() {
  clearTimeout(movieSearchTimer);
  movieSearchController?.abort();
  const query = document.querySelector("#fieldTitle").value.trim();
  if (query.length < 2) {
    hideMovieSearchResults();
    return;
  }
  movieSearchTimer = setTimeout(() => searchMovies(query), 350);
}

async function searchMovies(query) {
  const session = getSession();
  if (!session?.adminToken) return;
  const controller = new AbortController();
  movieSearchController = controller;
  const field = document.querySelector("#movieSearchField");
  field.hidden = false;
  document.querySelector("#movieSearchList").innerHTML = "";
  setMovieSearchStatus("Đang tìm phim...");
  try {
    const response = await fetch(
      `/api/admin/movie-search?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${session.adminToken}` },
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không tìm được phim.");
    if (
      controller.signal.aborted ||
      document.querySelector("#fieldTitle").value.trim() !== query
    ) {
      return;
    }
    renderMovieSearchResults(result.movies);
  } catch (error) {
    if (error.name === "AbortError") return;
    hideMovieSearchResults();
  } finally {
    if (movieSearchController === controller) movieSearchController = null;
  }
}

async function lookupMovieDetails(title) {
  const session = getSession();
  if (!session?.adminToken) {
    setRatingLookupStatus("Phiên quản trị không hợp lệ. Hãy đăng nhập lại.", "error");
    return;
  }
  const controller = new AbortController();
  ratingLookupController = controller;
  setRatingLookupStatus("Đang tra cứu thông tin phim...");
  try {
    const response = await fetch(
      `/api/admin/movie-details?title=${encodeURIComponent(title)}`,
      {
        headers: { Authorization: `Bearer ${session.adminToken}` },
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Không tra cứu được thông tin phim.");
    }
    if (
      controller.signal.aborted ||
      document.querySelector("#fieldTitle").value.trim() !== title
    ) {
      return;
    }
    const setIfAvailable = (selector, value) => {
      if (typeof value === "string" && value.trim()) {
        document.querySelector(selector).value = value.trim();
      }
    };
    const releaseYear = String(result.year || "").match(/\b\d{4}\b/)?.[0];
    if (releaseYear && isValidReleaseYear(releaseYear, currentYear)) {
      document.querySelector("#fieldYear").value = releaseYear;
      showYearError("");
    }
    setIfAvailable("#fieldReleaseDate", result.releaseDate);
    setIfAvailable("#fieldRuntime", result.runtime);
    setIfAvailable("#fieldLanguage", result.language);
    setIfAvailable("#fieldAgeRating", result.ageRating);
    if (result.rating !== null && !ratingManuallyEdited) {
      document.querySelector("#fieldRating").value =
        Number(result.rating).toFixed(1);
      selectedRatingSource = {
        name: "IMDb qua OMDb",
        title: result.title || title,
        year: result.year || "",
        imdbId: result.imdbId || "",
      };
    }
    setIfAvailable("#fieldPoster", result.poster);
    setIfAvailable("#fieldBackdrop", result.backdrop);
    setIfAvailable("#fieldDescription", result.description);
    setIfAvailable("#fieldCountry", result.country);
    setIfAvailable("#fieldDirector", result.director);
    setIfAvailable("#fieldCast", result.cast);
    setIfAvailable("#fieldWriters", result.writers);
    setIfAvailable("#fieldProducers", result.producers);
    setIfAvailable("#fieldStudio", result.studio);
    setIfAvailable("#fieldAwards", result.awards);
    setIfAvailable("#fieldBoxOffice", result.boxOffice);
    setIfAvailable("#fieldOfficialWebsite", result.website);
    setIfAvailable("#fieldCinematographers", result.cinematographers);
    setIfAvailable("#fieldComposers", result.composers);
    const trailerInput = document.querySelector("#fieldTrailerUrl");
    if (result.trailer && !trailerInput.value.trim()) {
      trailerInput.value = result.trailer;
    } else if (!trailerInput.value.trim()) {
      const knownTrailer = getTrailer({ title: result.title || title });
      if (knownTrailer?.kind === "file") {
        trailerInput.value = knownTrailer.url;
      } else if (knownTrailer?.id) {
        trailerInput.value = `https://www.youtube.com/watch?v=${knownTrailer.id}`;
      }
    }

    if (result.genre) {
      const genreMap = {
        Action: "Hành động",
        Adventure: "Phiêu lưu",
        Animation: "Hoạt hình",
        Comedy: "Hài",
        Crime: "Tội phạm",
        Documentary: "Tài liệu",
        Drama: "Chính kịch",
        Family: "Gia đình",
        Fantasy: "Giả tưởng",
        History: "Lịch sử",
        Horror: "Kinh dị",
        Music: "Âm nhạc",
        Mystery: "Bí ẩn",
        Romance: "Tình cảm",
        "Sci-Fi": "Khoa học viễn tưởng",
        "Science Fiction": "Khoa học viễn tưởng",
        Sport: "Thể thao",
        Thriller: "Tâm lý",
        War: "Chiến tranh",
        "TV Movie": "Phim truyền hình",
        Western: "Miền Tây",
      };
      const selectedGenres = result.genre
        .split(",")
        .map((genre) => genreMap[genre.trim()] || genre.trim())
        .filter(Boolean);
      const genreField = document.querySelector("#fieldGenre");
      const genreFilter = document.querySelector("#genreFilter");
      selectedGenres.forEach((genre) => {
        if (![...genreField.options].some((option) => option.value === genre)) {
          genreField.add(new Option(genre, genre));
        }
        if (![...genreFilter.options].some((option) => option.value === genre)) {
          genreFilter.add(new Option(genre, genre));
        }
      });
      [...genreField.options].forEach((option) => {
        option.selected = selectedGenres.includes(option.value);
      });
    }

    const filledFields = [
      result.year,
      result.releaseDate,
      result.rating,
      result.genre,
      result.poster,
      result.backdrop,
      result.description,
      result.director,
      result.cast,
      result.writers,
      result.studio,
      result.country,
      result.runtime,
      result.language,
      result.ageRating,
      result.awards,
      result.boxOffice,
      result.website,
      result.producers,
      result.cinematographers,
      result.composers,
      result.trailer,
    ].filter(Boolean).length;
    const trailerStatus = trailerInput.value.trim()
      ? "Đã có trailer."
      : "Chưa tìm thấy trailer; nhập link thủ công hoặc cấu hình TMDB_API_KEY.";
    setRatingLookupStatus(
      `Đã điền thông tin tìm được từ ${result.source}${filledFields ? ` · ${filledFields} mục` : ""}. ${trailerStatus} Link xem phim cần được thêm riêng.${result.notice ? ` ${result.notice}` : ""}`,
    );
  } catch (error) {
    if (error.name === "AbortError") return;
    setRatingLookupStatus(error.message, "error");
  } finally {
    if (ratingLookupController === controller) ratingLookupController = null;
  }
}

function renderMovieSearchResults(movies) {
  const list = document.querySelector("#movieSearchList");
  const searchResults = Array.isArray(movies) ? movies : [];
  list.innerHTML = searchResults
    .map(
      (movie) => `
        <button class="btn btn-ghost related-movie-option" type="button" role="option" data-search-title="${escapeHtml(movie.title)}">
          ${movie.poster ? `<img src="${escapeHtml(movie.poster)}" alt="" loading="lazy">` : ""}
          <span class="movie-search-copy"><span><strong>${escapeHtml(movie.title)}</strong>${movie.year ? ` <small>${escapeHtml(movie.year)}</small>` : ""}</span>
          ${movie.overview ? `<span class="related-movie-overview">${escapeHtml(movie.overview)}</span>` : ""}
          </span>
        </button>`,
    )
    .join("");
  setMovieSearchStatus(
    searchResults.length
      ? `${searchResults.length} kết quả. Chọn phim để điền thông tin.`
      : "Không tìm thấy phim phù hợp.",
  );
}

function setMovieSearchStatus(message) {
  const status = document.querySelector("#movieSearchStatus");
  status.textContent = message;
}

function hideMovieSearchResults() {
  const field = document.querySelector("#movieSearchField");
  if (field) field.hidden = true;
}

function parseNames(value) {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function formatNames(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function showYearError(message) {
  const error = document.querySelector("#fieldYearError");
  error.textContent = message;
  error.classList.toggle("is-visible", Boolean(message));
  document.querySelector("#fieldYear").setAttribute("aria-invalid", String(Boolean(message)));
}

function openDeleteConfirm(id) {
  const movie = movies.find((item) => item.id === id);
  if (!movie) return;
  deleteId = id;
  document.querySelector("#deleteMessage").textContent =
    `Phim "${movie.title}" sẽ bị xóa vĩnh viễn khỏi kho.`;
  openOverlay("deleteOverlay");
}

async function onDelete() {
  if (!deleteId) return;
  const movie = movies.find((item) => item.id === deleteId);
  const nextMovies = movies.filter((item) => item.id !== deleteId);
  try {
    await persist(nextMovies);
  } catch (error) {
    showToast(error.message, "error");
    return;
  }
  movies = nextMovies;
  closeOverlay("deleteOverlay");
  renderAll();
  showToast(movie ? `Đã xóa "${movie.title}".` : "Đã xóa phim.", "success");
}

function openOverlay(id) {
  const overlay = document.querySelector(`#${id}`);
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
}

function closeOverlay(id) {
  const overlay = document.querySelector(`#${id}`);
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

let toastTimer;
function showToast(message, type = "success") {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function escapeReviewText(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function renderReviewTable() {
  const body = document.querySelector("#reviewTableBody");
  if (!body) return;
  const reviews = loadReviews();
  body.innerHTML = reviews.length
    ? reviews
        .map(
          (review) => `
    <tr>
      <td>${escapeReviewText(review.author)}</td>
      <td>${escapeReviewText(review.movieTitle)}</td>
      <td>${escapeReviewText(review.comment)}</td>
      <td>${review.hidden ? "Đã ẩn" : "Đang hiển thị"}</td>
      <td><button type="button" class="btn btn-ghost btn-sm" data-review-id="${escapeReviewText(review.id)}">${review.hidden ? "Hiện" : "Ẩn"}</button></td>
    </tr>`,
        )
        .join("")
    : '<tr><td colspan="5">Chưa có bình luận.</td></tr>';
  body.querySelectorAll("[data-review-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const review = loadReviews().find(
        (item) => String(item.id) === button.dataset.reviewId,
      );
      if (!review) return;
      try {
        if (await setReviewHidden(review.id, !review.hidden)) {
          renderReviewTable();
          showToast(review.hidden ? "Đã hiện bình luận." : "Đã ẩn bình luận.");
        }
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}
