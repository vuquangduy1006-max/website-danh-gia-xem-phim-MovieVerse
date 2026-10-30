import "../admin/admin.css";
import "../admin/genres.css";
import "../admin/schedule-admin.css";
import { isAdmin } from "./auth.js";
import { renderAdminHeader } from "./admin-navigation.js";
import {
  getMovieDB,
  getReleaseSchedule,
  initializeCatalog,
  saveSharedSchedule,
} from "./data.js";

if (!isAdmin()) {
  window.location.replace("/login.html?next=/admin/schedule.html");
} else {
  const catalogReady = await initializeCatalog();
  if (!catalogReady) {
    document.querySelector("#app").innerHTML =
      '<main class="admin-main"><div class="container"><p class="schedule-admin-error">Không thể tải danh mục và lịch. Tải lại trang hoặc thử lại sau.</p></div></main>';
  } else {
    const movies = getMovieDB();
    let schedule = getReleaseSchedule();
    const currentDate = localDateKey(new Date());

    document.querySelector("#app").innerHTML = `
      ${renderAdminHeader("/admin/schedule.html")}
      <main class="admin-main schedule-admin-main">
        <div class="container">
          <div class="admin-heading">
            <div>
              <p class="eyebrow">Quản trị</p>
              <h1>Lịch phát hành</h1>
              <p>Lên lịch phim sắp chiếu và ngày phát hành tập mới để mọi người cùng theo dõi.</p>
            </div>
          </div>
          <section class="admin-panel schedule-admin-form-panel" aria-labelledby="scheduleFormTitle">
            <div class="schedule-admin-panel-heading">
              <div>
                <h2 id="scheduleFormTitle">Thêm sự kiện</h2>
                <p>Ngày và giờ được hiển thị theo múi giờ Việt Nam (GMT+7).</p>
              </div>
            </div>
            <form id="scheduleForm" class="schedule-admin-form">
              <label>Loại sự kiện
                <select class="toolbar-select" id="eventType">
                  <option value="movie">Phim mới</option>
                  <option value="episode">Tập mới</option>
                </select>
              </label>
              <label>Phim
                <select class="toolbar-select" id="eventMovie" required>
                  ${movies.map((movie) => `<option value="${escapeHtml(movie.id)}">${escapeHtml(movie.title)}</option>`).join("")}
                </select>
              </label>
              <label>Ngày phát hành
                <input class="toolbar-input" id="eventDate" type="date" min="${currentDate}" required>
              </label>
              <label>Giờ phát hành (GMT+7, không bắt buộc)
                <input class="toolbar-input" id="eventTime" type="time">
              </label>
              <label id="episodeField" hidden>Tập số
                <input class="toolbar-input" id="episodeNumber" type="number" min="1" max="999" step="1" inputmode="numeric">
              </label>
              <label class="schedule-admin-note">Ghi chú (không bắt buộc)
                <input class="toolbar-input" id="eventNote" type="text" maxlength="240" placeholder="Ví dụ: Phát hành trên nền tảng chính thức">
              </label>
              <div class="schedule-admin-submit">
                <button class="btn btn-primary" type="submit">+ Thêm vào lịch</button>
              </div>
            </form>
          </section>
          <section class="admin-panel schedule-admin-list" aria-labelledby="scheduleListTitle">
            <div class="schedule-admin-panel-heading">
              <div>
                <h2 id="scheduleListTitle">Các sự kiện đã lên lịch</h2>
                <p>Chỉ các ngày hôm nay và trong tương lai hiển thị trên lịch công khai.</p>
              </div>
              <span class="schedule-admin-count" id="scheduleCount"></span>
            </div>
            <div class="table-wrap">
              <table class="movie-table schedule-admin-table">
                <thead><tr><th>Ngày, giờ</th><th>Phim / tập</th><th>Loại</th><th>Ghi chú</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                <tbody id="scheduleTableBody"></tbody>
              </table>
            </div>
          </section>
          <p class="schedule-admin-storage-note">Lịch được lưu trên máy chủ và hiển thị công khai trong trang Lịch phát hành.</p>
        </div>
      </main>
      <footer class="admin-footer"><div class="container"><span>© 2024 MovieVerse Admin.</span><span>Quản lý lịch phát hành</span></div></footer>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    `;

    const form = document.querySelector("#scheduleForm");
    const typeInput = document.querySelector("#eventType");
    const episodeField = document.querySelector("#episodeField");
    const episodeInput = document.querySelector("#episodeNumber");

    function updateEpisodeField() {
      const isEpisode = typeInput.value === "episode";
      episodeField.hidden = !isEpisode;
      episodeInput.required = isEpisode;
    }

    function renderSchedule() {
      const events = [...schedule].sort((left, right) =>
        `${left.date} ${left.time || ""}`.localeCompare(
          `${right.date} ${right.time || ""}`,
        ),
      );
      document.querySelector("#scheduleCount").textContent =
        `${events.length} ${events.length === 1 ? "sự kiện" : "sự kiện"}`;
      document.querySelector("#scheduleTableBody").innerHTML = events.length
        ? events
            .map((event) => {
              const movie = movies.find((item) => item.id === event.movieId);
              const title = movie
                ? `${movie.title}${event.type === "episode" ? ` · Tập ${String(event.episodeNumber).padStart(2, "0")}` : ""}`
                : "Phim không còn trong danh mục";
              const isPast = event.date < currentDate;
              return `<tr>
                <td>${formatDate(event.date)}${event.time ? `<br><span class="schedule-admin-muted">${event.time} GMT+7</span>` : ""}</td>
                <td>${escapeHtml(title)}</td>
                <td><span class="badge ${event.type === "episode" ? "genre" : ""}">${event.type === "episode" ? "Tập mới" : "Phim mới"}</span></td>
                <td>${escapeHtml(event.note || "—")}</td>
                <td><span class="schedule-admin-status${isPast ? " is-past" : ""}">${isPast ? "Đã qua" : "Sắp tới"}</span></td>
                <td><button class="btn btn-danger btn-sm" type="button" data-remove="${escapeHtml(event.id)}" aria-label="Xóa lịch ${escapeHtml(title)}">Xóa</button></td>
              </tr>`;
            })
            .join("")
        : '<tr><td colspan="6"><div class="empty-state"><h3>Chưa có sự kiện nào</h3><p>Thêm ngày chiếu hoặc ngày ra tập mới bằng biểu mẫu phía trên.</p></div></td></tr>';
    }

    function showToast(message, type = "success") {
      const toast = document.querySelector("#toast");
      toast.textContent = message;
      toast.className = `toast ${type} show`;
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3500);
    }

    async function persist(nextSchedule) {
      try {
        schedule = await saveSharedSchedule(nextSchedule);
        renderSchedule();
        return true;
      } catch (error) {
        showToast(error.message, "error");
        if (error.message.includes("cập nhật ở nơi khác")) {
          window.setTimeout(() => window.location.reload(), 1800);
        }
        return false;
      }
    }

    typeInput.addEventListener("change", updateEpisodeField);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const movieId = document.querySelector("#eventMovie").value;
      if (!movies.some((movie) => movie.id === movieId)) {
        showToast("Hãy chọn một phim trong danh mục.", "error");
        return;
      }
      const type = typeInput.value;
      const episodeNumber = Number(episodeInput.value);
      if (type === "episode" && (!Number.isInteger(episodeNumber) || episodeNumber < 1 || episodeNumber > 999)) {
        showToast("Số tập phải từ 1 đến 999.", "error");
        episodeInput.focus();
        return;
      }
      const newEvent = {
        id: uid(),
        movieId,
        type,
        date: document.querySelector("#eventDate").value,
        time: document.querySelector("#eventTime").value || null,
        ...(type === "episode" ? { episodeNumber } : {}),
        note: document.querySelector("#eventNote").value.trim(),
      };
      const submitButton = form.querySelector('[type="submit"]');
      submitButton.disabled = true;
      const saved = await persist([newEvent, ...schedule]);
      submitButton.disabled = false;
      if (saved) {
        form.reset();
        document.querySelector("#eventDate").min = localDateKey(new Date());
        updateEpisodeField();
        showToast("Đã thêm sự kiện vào lịch.");
      }
    });
    document.querySelector("#scheduleTableBody").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      const target = schedule.find((item) => item.id === button.dataset.remove);
      if (!target || !window.confirm("Bạn muốn xóa sự kiện này khỏi lịch?")) return;
      await persist(schedule.filter((item) => item.id !== target.id));
    });

    updateEpisodeField();
    renderSchedule();
  }
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
