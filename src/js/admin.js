import "../css/admin.css";
import { getMovieDB, saveMovieDB, genreList } from "./data.js";

const DB_KEY = "movieverse_db";
let movies = loadDB();

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.movies) && parsed.movies.length) {
        return parsed.movies;
      }
    } catch (_) {}
  }
  return getMovieDB();
}

function persist() {
  saveMovieDB(movies);
}

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  );
}

let currentFilter = "all";
let currentQuery = "";
let editingId = null;
let deleteId = null;

document.querySelector("#app").innerHTML = `
<header class="admin-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
    <nav class="admin-nav" aria-label="Điều hướng quản trị">
      <a href="/" class="back-link">← Trang chủ</a>
      <a class="active" href="/admin.html">Quản lý phim</a>
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

    <div class="admin-panel">
      <div class="panel-toolbar">
        <input class="toolbar-input" id="searchInput" type="search" placeholder="Tìm theo tên phim...">
        <select class="toolbar-select" id="genreFilter" aria-label="Lọc theo thể loại"></select>
      </div>
      <div class="table-wrap">
        <table class="movie-table">
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
            <input id="fieldTitle" type="text" placeholder="VD: Dune: Part Two" required>
          </div>
          <div class="field">
            <label for="fieldYear">Năm phát hành</label>
            <input id="fieldYear" type="number" min="1900" max="2100" placeholder="2024">
          </div>
          <div class="field">
            <label for="fieldRating">Đánh giá (0 - 10)</label>
            <input id="fieldRating" type="number" min="0" max="10" step="0.1" placeholder="8.5">
          </div>
          <div class="field">
            <label for="fieldGenre">Thể loại</label>
            <select id="fieldGenre"></select>
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
            <label for="fieldDescription">Mô tả</label>
            <textarea id="fieldDescription" placeholder="Tóm tắt nội dung phim..."></textarea>
          </div>
        </div>
        <p class="form-note">* là trường bắt buộc. Dữ liệu được lưu trên trình duyệt (localStorage).</p>
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

init();

function init() {
  fillGenreSelects();
  bindEvents();
  renderAll();
}

function fillGenreSelects() {
  const filter = document.querySelector("#genreFilter");
  filter.innerHTML = `<option value="all">Tất cả thể loại</option>` +
    genreList
      .map((genre) => `<option value="${genre}">${genre}</option>`)
      .join("");

  const field = document.querySelector("#fieldGenre");
  field.innerHTML = genreList
    .map((genre) => `<option value="${genre}">${genre}</option>`)
    .join("");
}

function bindEvents() {
  document.querySelector("#addMovieBtn").addEventListener("click", openAddForm);
  document.querySelector("#movieForm").addEventListener("submit", onSave);
  document.querySelector("#confirmDeleteBtn").addEventListener("click", onDelete);
  document.querySelector("#searchInput").addEventListener("input", (event) => {
    currentQuery = event.target.value;
    renderTable();
  });
  document.querySelector("#genreFilter").addEventListener("change", (event) => {
    currentFilter = event.target.value;
    renderAll();
  });
  document.querySelectorAll("[data-close]").forEach((button) =>
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
}

function renderStats() {
  const total = movies.length;
  const avg =
    total > 0
      ? (movies.reduce((sum, movie) => sum + Number(movie.rating) || 0, 0) / total)
      : 0;
  const genreCount = new Set(movies.map((movie) => movie.genre)).size;
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
      currentFilter === "all" || movie.genre === currentFilter;
    const matchQuery =
      !query || movie.title.toLowerCase().includes(query);
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
          <td><span class="badge genre">${movie.genre}</span></td>
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

  body.querySelectorAll("[data-edit]").forEach((button) =>
    button.addEventListener("click", () => openEditForm(button.dataset.edit)),
  );
  body.querySelectorAll("[data-delete]").forEach((button) =>
    button.addEventListener("click", () => openDeleteConfirm(button.dataset.delete)),
  );
}

function openAddForm() {
  editingId = null;
  document.querySelector("#formTitle").textContent = "Thêm phim mới";
  document.querySelector("#movieForm").reset();
  document.querySelector("#fieldId").value = "";
  document.querySelector("#fieldGenre").value = "Hành động";
  document.querySelector("#fieldIsNew").checked = true;
  openOverlay("formOverlay");
  document.querySelector("#fieldTitle").focus();
}

function openEditForm(id) {
  const movie = movies.find((item) => item.id === id);
  if (!movie) return;
  editingId = id;
  document.querySelector("#formTitle").textContent = "Chỉnh sửa phim";
  document.querySelector("#fieldId").value = movie.id;
  document.querySelector("#fieldTitle").value = movie.title;
  document.querySelector("#fieldYear").value = movie.year || "";
  document.querySelector("#fieldRating").value = movie.rating || "";
  document.querySelector("#fieldGenre").value = movie.genre || genreList[0];
  document.querySelector("#fieldIsNew").checked = Boolean(movie.isNew);
  document.querySelector("#fieldPoster").value = movie.poster || "";
  document.querySelector("#fieldBackdrop").value = movie.backdrop || "";
  document.querySelector("#fieldDescription").value = movie.description || "";
  openOverlay("formOverlay");
  document.querySelector("#fieldTitle").focus();
}

function onSave(event) {
  event.preventDefault();
  const form = document.querySelector("#movieForm");
  const title = document.querySelector("#fieldTitle").value.trim();
  if (!title) {
    showToast("Vui lòng nhập tên phim.", "error");
    document.querySelector("#fieldTitle").focus();
    return;
  }

  const movie = {
    id:
      editingId ||
      (document.querySelector("#fieldId").value || uid()),
    title,
    year: document.querySelector("#fieldYear").value.trim() || "2024",
    genre: document.querySelector("#fieldGenre").value,
    rating: document.querySelector("#fieldRating").value.trim() || "8.0",
    isNew: document.querySelector("#fieldIsNew").checked,
    poster:
      document.querySelector("#fieldPoster").value.trim() ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=85",
    backdrop:
      document.querySelector("#fieldBackdrop").value.trim() ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&q=85",
    description:
      document.querySelector("#fieldDescription").value.trim() ||
      "Chưa có mô tả cho phim này.",
  };

  const index = movies.findIndex((item) => item.id === movie.id);
  if (index === -1) {
    movies.unshift(movie);
    showToast(`Đã thêm "${movie.title}".`, "success");
  } else {
    movies[index] = movie;
    showToast(`Đã cập nhật "${movie.title}".`, "success");
  }

  persist();
  closeOverlay("formOverlay");
  renderAll();
  form.reset();
}

function openDeleteConfirm(id) {
  const movie = movies.find((item) => item.id === id);
  if (!movie) return;
  deleteId = id;
  document.querySelector("#deleteMessage").textContent =
    `Phim "${movie.title}" sẽ bị xóa vĩnh viễn khỏi kho.`;
  openOverlay("deleteOverlay");
}

function onDelete() {
  if (!deleteId) return;
  const movie = movies.find((item) => item.id === deleteId);
  movies = movies.filter((item) => item.id !== deleteId);
  persist();
  closeOverlay("deleteOverlay");
  renderAll();
  showToast(
    movie ? `Đã xóa "${movie.title}".` : "Đã xóa phim.",
    "success",
  );
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