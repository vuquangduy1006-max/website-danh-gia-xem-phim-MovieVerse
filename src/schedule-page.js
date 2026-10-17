import "./style.css";
import "./schedule-page.css";
import {
  getMovieDB,
  getReleaseSchedule,
  initializeCatalog,
} from "./data/data.js";
import {
  bindAccountActions,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

const catalogReady = await initializeCatalog();
const movies = getMovieDB();
const movieById = new Map(movies.map((movie) => [movie.id, movie]));
const schedule = getReleaseSchedule();
const today = localDateKey(new Date());
let month = new Date();
month.setDate(1);
let selectedDate = null;
let eventType = "all";

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "/",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "/new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    reviewsHref: "/reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "/favorites.html",
    favoritesActive: "",
    favoritesCurrent: "",
    rankingHref: "/ranking.html",
    rankingActive: "",
    rankingCurrent: "",
    scheduleActive: "active",
    scheduleCurrent: 'aria-current="page"',
    headerActions: `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>`,
  })}
  <main class="schedule-page">
    <section class="schedule-intro">
      <div class="container schedule-intro-inner">
        <p class="eyebrow">MovieVerse · Sắp tới</p>
        <h1>Lịch phát hành</h1>
        <p>Theo dõi phim sắp chiếu và ngày có tập mới. Lịch được cập nhật bởi quản trị viên.</p>
      </div>
    </section>
    <section class="container schedule-content" aria-labelledby="scheduleHeading">
      <div class="schedule-toolbar">
        <div>
          <p class="eyebrow">Lịch phim</p>
          <h2 id="scheduleHeading">Lịch tháng</h2>
        </div>
        <div class="schedule-controls">
          <label class="sr-only" for="scheduleType">Lọc lịch phát hành</label>
          <select id="scheduleType">
            <option value="all">Tất cả</option>
            <option value="movie">Phim mới</option>
            <option value="episode">Tập mới</option>
          </select>
          <div class="schedule-month-controls" aria-label="Chọn tháng">
            <button type="button" id="previousMonth" aria-label="Tháng trước">←</button>
            <span id="scheduleMonthLabel"></span>
            <button type="button" id="nextMonth" aria-label="Tháng sau">→</button>
          </div>
        </div>
      </div>
      <p class="schedule-notice" id="scheduleNotice" role="status" hidden></p>
      <div class="schedule-calendar" id="scheduleCalendar" aria-label="Lịch phát hành tháng"></div>
      <section class="schedule-agenda" aria-labelledby="agendaTitle">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Các ngày đã lên lịch</p>
            <h2 id="agendaTitle">Sắp phát hành</h2>
          </div>
          <span id="scheduleCount"></span>
        </div>
        <div class="schedule-events" id="scheduleEvents"></div>
      </section>
    </section>
  </main>
  ${renderFooter({
    footerClass: " new-page-footer",
    homeHref: "/",
    newMoviesHref: "/new-movies.html",
    rankingHref: "/ranking.html",
    genresHref: "/genres.html",
    aboutHref: "/",
  })}
`;

bindAccountActions();
const calendar = document.querySelector("#scheduleCalendar");
const typeSelect = document.querySelector("#scheduleType");
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(value) {
  const [year, monthNumber, day] = value.split("-").map(Number);
  return new Date(year, monthNumber - 1, day);
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

function visibleEvents() {
  return schedule
    .filter(
      (event) =>
        event.date >= today &&
        (eventType === "all" || event.type === eventType) &&
        movieById.has(event.movieId),
    )
    .sort((left, right) =>
      `${left.date} ${left.time || ""}`.localeCompare(
        `${right.date} ${right.time || ""}`,
      ),
    );
}

function render() {
  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(month);
  document.querySelector("#scheduleMonthLabel").textContent = monthLabel;
  document.querySelector("#scheduleHeading").textContent =
    `Lịch ${monthLabel}`;
  const previousMonth = document.querySelector("#previousMonth");
  previousMonth.disabled =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  if (!catalogReady) {
    const notice = document.querySelector("#scheduleNotice");
    notice.hidden = false;
    notice.textContent =
      "Không thể tải lịch phát hành. Hãy tải lại trang hoặc thử lại sau.";
    calendar.innerHTML = "";
    document.querySelector("#scheduleEvents").innerHTML = "";
    document.querySelector("#scheduleCount").textContent = "";
    return;
  }

  const events = visibleEvents();
  const monthEvents = events.filter((event) => {
    const date = parseLocalDate(event.date);
    return (
      date.getFullYear() === month.getFullYear() &&
      date.getMonth() === month.getMonth()
    );
  });
  const eventsByDate = new Map();
  for (const event of monthEvents) {
    eventsByDate.set(event.date, [...(eventsByDate.get(event.date) || []), event]);
  }
  const firstWeekday = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => '<div class="schedule-day is-empty" aria-hidden="true"></div>'),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = localDateKey(
        new Date(month.getFullYear(), month.getMonth(), day),
      );
      const dayEvents = eventsByDate.get(dateKey) || [];
      const isSelected = selectedDate === dateKey;
      return `<button class="schedule-day${dayEvents.length ? " has-events" : ""}${isSelected ? " is-selected" : ""}${dateKey === today ? " is-today" : ""}" type="button" data-date="${dateKey}"${dayEvents.length ? ` aria-label="${day} tháng ${month.getMonth() + 1}: ${dayEvents.length} sự kiện"` : ` aria-label="${day} tháng ${month.getMonth() + 1}"`}${dayEvents.length ? "" : " disabled"}><span>${day}</span>${dayEvents.length ? `<small>${dayEvents.length} mục</small>` : ""}</button>`;
    }),
  ];
  calendar.innerHTML = `
    <div class="schedule-weekdays" aria-hidden="true">
      ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => `<span>${day}</span>`).join("")}
    </div>
    <div class="schedule-days">${cells.join("")}</div>
  `;

  const agendaEvents = selectedDate
    ? monthEvents.filter((event) => event.date === selectedDate)
    : monthEvents;
  document.querySelector("#agendaTitle").textContent = selectedDate
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(parseLocalDate(selectedDate))
    : "Sắp phát hành";
  document.querySelector("#scheduleCount").textContent =
    `${agendaEvents.length} sự kiện`;
  document.querySelector("#scheduleEvents").innerHTML = agendaEvents.length
    ? agendaEvents.map(renderEvent).join("")
    : `<div class="schedule-empty"><span aria-hidden="true">◷</span><h3>${events.length ? "Chưa có lịch trong tháng này" : "Chưa có lịch phát hành"}</h3><p>${events.length ? "Chọn tháng khác để xem các phim và tập sắp tới." : "Lịch phim hoặc tập mới sẽ xuất hiện tại đây khi được cập nhật."}</p></div>`;
}

function renderEvent(event) {
  const movie = movieById.get(event.movieId);
  const episode = event.type === "episode";
  const label = episode
    ? `Tập ${String(event.episodeNumber).padStart(2, "0")}`
    : "Phim mới";
  const date = parseLocalDate(event.date);
  const dateText = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const href = `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;
  const poster = movie.poster
    ? `<img src="${escapeHtml(movie.poster)}" alt="" loading="lazy">`
    : "";
  return `<article class="schedule-event">
    <a class="schedule-event-poster" href="${href}" aria-label="Xem ${escapeHtml(movie.title)}">${poster}</a>
    <div class="schedule-event-main">
      <div class="schedule-event-meta"><span class="schedule-event-type${episode ? " is-episode" : ""}">${label}</span><time datetime="${event.date}${event.time ? `T${event.time}:00+07:00` : ""}">${dateText}${event.time ? ` · ${event.time} (GMT+7)` : ""}</time></div>
      <h3><a href="${href}">${escapeHtml(movie.title)}${episode ? ` · ${label}` : ""}</a></h3>
      ${event.note ? `<p>${escapeHtml(event.note)}</p>` : ""}
    </div>
    <a class="schedule-event-link" href="${href}" aria-label="Xem ${escapeHtml(movie.title)}">↗</a>
  </article>`;
}

calendar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  selectedDate = selectedDate === button.dataset.date ? null : button.dataset.date;
  render();
});
typeSelect.addEventListener("change", () => {
  eventType = typeSelect.value;
  selectedDate = null;
  render();
});
document.querySelector("#previousMonth").addEventListener("click", () => {
  month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  selectedDate = null;
  render();
});
document.querySelector("#nextMonth").addEventListener("click", () => {
  month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  selectedDate = null;
  render();
});

render();
