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
const weekStart = parseLocalDate(today);
weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
let displayedWeek = new Date(weekStart);
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
          <h2 id="scheduleHeading">Lịch theo tuần</h2>
        </div>
        <div class="schedule-controls">
          <label class="sr-only" for="scheduleType">Lọc lịch phát hành</label>
          <select id="scheduleType">
            <option value="all">Tất cả</option>
            <option value="movie">Phim mới</option>
            <option value="episode">Tập mới</option>
          </select>
          <div class="schedule-week-controls" aria-label="Chọn tuần">
            <button type="button" id="previousWeek" aria-label="Tuần trước">←</button>
            <span id="scheduleWeekLabel"></span>
            <button type="button" id="nextWeek" aria-label="Tuần sau">→</button>
          </div>
          <span class="schedule-count" id="scheduleCount"></span>
        </div>
      </div>
      <p class="schedule-notice" id="scheduleNotice" role="status" hidden></p>
      <div class="schedule-week-scroll" tabindex="0" aria-label="Lịch phát hành theo ngày trong tuần">
        <div class="schedule-week-grid" id="scheduleWeek"></div>
      </div>
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
const weekGrid = document.querySelector("#scheduleWeek");
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
  const weekEnd = new Date(displayedWeek);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const dateRange = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const weekLabel = `${dateRange.format(displayedWeek)} – ${dateRange.format(weekEnd)}`;
  document.querySelector("#scheduleWeekLabel").textContent = weekLabel;
  document.querySelector("#scheduleHeading").textContent = `Lịch tuần ${weekLabel}`;
  document.querySelector("#previousWeek").disabled =
    displayedWeek.getTime() <= weekStart.getTime();

  if (!catalogReady) {
    const notice = document.querySelector("#scheduleNotice");
    notice.hidden = false;
    notice.textContent =
      "Không thể tải lịch phát hành. Hãy tải lại trang hoặc thử lại sau.";
    weekGrid.innerHTML = "";
    document.querySelector("#scheduleCount").textContent = "";
    return;
  }

  const events = visibleEvents();
  const firstDate = localDateKey(displayedWeek);
  const lastDate = localDateKey(weekEnd);
  const weekEvents = events.filter(
    (event) => event.date >= firstDate && event.date <= lastDate,
  );
  const eventsByDate = new Map();
  for (const event of weekEvents) {
    eventsByDate.set(event.date, [...(eventsByDate.get(event.date) || []), event]);
  }
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(displayedWeek);
    date.setDate(date.getDate() + index);
    const dateKey = localDateKey(date);
    const dayEvents = eventsByDate.get(dateKey) || [];
    const weekday = new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
    }).format(date);
    const dateText = new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "numeric",
    }).format(date);
    return `<section class="schedule-week-day${dateKey === today ? " is-today" : ""}" aria-label="${escapeHtml(`${weekday}, ${dateText}`)}">
      <header class="schedule-week-day-heading"><h3>${escapeHtml(weekday)}</h3><time datetime="${dateKey}">${dateText}</time></header>
      <div class="schedule-week-day-events">${dayEvents.length ? dayEvents.map(renderEvent).join("") : '<p class="schedule-day-empty">Chưa có lịch</p>'}</div>
    </section>`;
  });
  weekGrid.innerHTML = weekDays.join("");
  document.querySelector("#scheduleCount").textContent =
    `${weekEvents.length} sự kiện`;
}

function renderEvent(event) {
  const movie = movieById.get(event.movieId);
  const episode = event.type === "episode";
  const label = episode
    ? `Tập ${String(event.episodeNumber).padStart(2, "0")}`
    : "Phim mới";
  const href = `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;
  const poster = movie.poster
    ? `<img src="${escapeHtml(movie.poster)}" alt="" loading="lazy">`
    : "";
  return `<article class="schedule-event">
    <a class="schedule-event-poster" href="${href}" aria-label="Xem ${escapeHtml(movie.title)}">${poster}</a>
    <div class="schedule-event-main">
      <div class="schedule-event-meta"><span class="schedule-event-type${episode ? " is-episode" : ""}">${label}</span><time datetime="${event.date}${event.time ? `T${event.time}:00+07:00` : ""}">${event.time ? `${event.time} GMT+7` : "Chưa có giờ"}</time></div>
      <h3><a href="${href}">${escapeHtml(movie.title)}${episode ? ` · ${label}` : ""}</a></h3>
      ${event.note ? `<p>${escapeHtml(event.note)}</p>` : ""}
    </div>
    <a class="schedule-event-link" href="${href}" aria-label="Xem ${escapeHtml(movie.title)}">↗</a>
  </article>`;
}

typeSelect.addEventListener("change", () => {
  eventType = typeSelect.value;
  render();
});
document.querySelector("#previousWeek").addEventListener("click", () => {
  displayedWeek.setDate(displayedWeek.getDate() - 7);
  render();
});
document.querySelector("#nextWeek").addEventListener("click", () => {
  displayedWeek.setDate(displayedWeek.getDate() + 7);
  render();
});

render();
