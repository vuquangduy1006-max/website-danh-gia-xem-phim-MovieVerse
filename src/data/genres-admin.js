import "../admin/admin.css";
import "../admin/genres.css";
import { isAdmin } from "./auth.js";
import {
  getGenreList,
  getMovieDB,
  getMovieGenres,
  saveGenreList,
  saveMovieDB,
} from "./data.js";

if (!isAdmin()) {
  window.location.replace("../login.html?next=../admin/genres.html");
} else {
  let genres = getGenreList();
  let query = "";

  document.querySelector("#app").innerHTML = `
    <header class="admin-header">
      <div class="container header-inner">
        <a class="brand" href="../" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="admin-nav" aria-label="Điều hướng quản trị">
          <a href="../admin/admin.html">Quản lý phim</a>
          <a class="active" href="../admin/genres.html" aria-current="page">Thể loại</a>
          <a href="../admin/comments.html">Bình luận</a>
          <a href="../" class="back-link">← Trang chủ</a>
        </nav>
        <div class="header-actions"><span class="admin-role">ADMIN</span></div>
      </div>
    </header>
    <main class="admin-main">
      <div class="container">
        <div class="admin-heading">
          <div>
            <p class="eyebrow">Quản trị danh mục</p>
            <h1>Quản lý thể loại</h1>
            <p>Thêm, đổi tên và theo dõi thể loại đang được sử dụng trong kho phim.</p>
          </div>
        </div>
        <div class="genre-admin-stats" id="genreStats"></div>
        <section class="admin-panel genre-management-panel" aria-labelledby="genreManagementTitle">
          <div class="genre-management-heading">
            <div>
              <h2 id="genreManagementTitle">Danh sách thể loại</h2>
              <p>Đổi tên thể loại sẽ cập nhật các phim đang sử dụng thể loại đó.</p>
            </div>
            <form class="genre-add-form" id="genreForm">
              <label class="sr-only" for="genreName">Tên thể loại mới</label>
              <input class="toolbar-input" id="genreName" type="text" maxlength="40" placeholder="Tên thể loại mới..." required>
              <button class="btn btn-primary" type="submit">+ Thêm thể loại</button>
            </form>
          </div>
          <div class="panel-toolbar">
            <input class="toolbar-input" id="genreSearch" type="search" placeholder="Tìm thể loại...">
          </div>
          <div class="table-wrap">
            <table class="movie-table genre-admin-table">
              <thead><tr><th>Tên thể loại</th><th>Số phim</th><th style="text-align:right">Hành động</th></tr></thead>
              <tbody id="genreTableBody"></tbody>
            </table>
          </div>
        </section>
        <p class="genre-storage-note">Danh mục được lưu trên trình duyệt này và dùng trong trang quản lý phim.</p>
      </div>
    </main>
    <footer class="admin-footer"><div class="container"><span>© 2024 MovieVerse Admin.</span><span>Quản lý danh mục</span></div></footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );

  function getUsageCounts() {
    const counts = new Map(genres.map((genre) => [genre, 0]));
    getMovieDB().forEach((movie) => {
      new Set(getMovieGenres(movie)).forEach((genre) => {
        if (counts.has(genre)) counts.set(genre, counts.get(genre) + 1);
      });
    });
    return counts;
  }

  function render() {
    const counts = getUsageCounts();
    const filtered = genres.filter((genre) =>
      genre
        .toLocaleLowerCase("vi")
        .includes(query.trim().toLocaleLowerCase("vi")),
    );
    const usedCount = [...counts.values()].filter((count) => count > 0).length;

    document.querySelector("#genreStats").innerHTML = `
      <div class="stat-card"><div class="stat-label">Tổng thể loại</div><div class="stat-value">${genres.length}</div><div class="stat-sub">trong danh mục</div></div>
      <div class="stat-card"><div class="stat-label">Đang được dùng</div><div class="stat-value accent">${usedCount}</div><div class="stat-sub">có phim liên kết</div></div>
      <div class="stat-card"><div class="stat-label">Chưa có phim</div><div class="stat-value">${genres.length - usedCount}</div><div class="stat-sub">có thể xóa</div></div>
    `;
    document.querySelector("#genreTableBody").innerHTML = filtered.length
      ? filtered
          .map(
            (genre) => `
              <tr>
                <td><span class="badge genre">${escapeHtml(genre)}</span></td>
                <td>${counts.get(genre) || 0} phim</td>
                <td><div class="row-actions">
                  <button class="btn btn-ghost btn-sm" type="button" data-edit-genre="${escapeHtml(genre)}">Đổi tên</button>
                  <button class="btn btn-danger btn-sm" type="button" data-delete-genre="${escapeHtml(genre)}">Xóa</button>
                </div></td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="3"><div class="empty-state"><h3>Không tìm thấy thể loại</h3><p>Thử từ khóa khác hoặc thêm thể loại mới.</p></div></td></tr>`;
  }

  function showToast(message, type = "success") {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(
      () => toast.classList.remove("show"),
      2600,
    );
  }

  document.querySelector("#genreForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#genreName");
    const name = input.value.trim();
    if (!name) return;
    if (
      genres.some(
        (genre) =>
          genre.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"),
      )
    ) {
      showToast("Thể loại này đã tồn tại.", "error");
      input.focus();
      return;
    }
    genres = [...genres, name].sort((a, b) => a.localeCompare(b, "vi"));
    saveGenreList(genres);
    input.value = "";
    render();
    showToast(`Đã thêm thể loại "${name}".`);
  });

  document.querySelector("#genreSearch").addEventListener("input", (event) => {
    query = event.target.value;
    render();
  });

  document
    .querySelector("#genreTableBody")
    .addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-genre]");
      if (editButton) {
        const oldName = editButton.dataset.editGenre;
        const newName = window
          .prompt("Nhập tên thể loại mới:", oldName)
          ?.trim();
        if (!newName || newName === oldName) return;
        if (
          genres.some(
            (genre) =>
              genre !== oldName &&
              genre.toLocaleLowerCase("vi") === newName.toLocaleLowerCase("vi"),
          )
        ) {
          showToast("Tên thể loại này đã được sử dụng.", "error");
          return;
        }
        const movies = getMovieDB();
        let moviesChanged = false;
        movies.forEach((movie) => {
          const movieGenres = getMovieGenres(movie);
          if (movieGenres.includes(oldName)) {
            movie.genre = movieGenres
              .map((genre) => (genre === oldName ? newName : genre))
              .join(", ");
            moviesChanged = true;
          }
        });
        genres = genres.map((genre) => (genre === oldName ? newName : genre));
        saveGenreList(genres);
        if (moviesChanged) saveMovieDB(movies);
        render();
        showToast(`Đã đổi tên thành "${newName}".`);
        return;
      }

      const deleteButton = event.target.closest("[data-delete-genre]");
      if (!deleteButton) return;
      const name = deleteButton.dataset.deleteGenre;
      const usageCount = getUsageCounts().get(name) || 0;
      if (usageCount) {
        showToast(
          `Không thể xóa: còn ${usageCount} phim thuộc thể loại này.`,
          "error",
        );
        return;
      }
      if (!window.confirm(`Xóa thể loại "${name}"?`)) return;
      genres = genres.filter((genre) => genre !== name);
      saveGenreList(genres);
      render();
      showToast(`Đã xóa thể loại "${name}".`);
    });

  render();
}
