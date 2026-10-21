import footerTemplate from "./footer.html?raw";
import headerTemplate from "./header.html?raw";
import { getSession, logoutUser } from "../data/auth.js";
import { getMovieDB, getMovieGenres } from "../data/data.js";
import { mountAssistantChat } from "../assistant-chat.js";

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");
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

export function renderHeaderSearch() {
  return `<form class="header-search" id="headerSearch" role="search">
  <label class="sr-only" for="searchInput">Tìm phim</label>
  <input id="searchInput" type="search" placeholder="Tìm phim..." autocomplete="off" aria-controls="searchResults">
  <button class="header-search-button" type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">⌕</button>
  <div class="search-results" id="searchResults" aria-live="polite"></div>
</form>`;
}

export function renderHeader(values) {
  const availableGenres = [
    ...new Set(getMovieDB().flatMap(getMovieGenres)),
  ].sort((a, b) => a.localeCompare(b, "vi"));
  const genreMenu = availableGenres
    .map(
      (genre) =>
        `<a href="/genres.html?genre=${encodeURIComponent(genre)}">${genre}</a>`,
    )
    .join("");
  const headerActions = values.headerActions || "";
  const actionsWithSearch = headerActions.includes('class="header-search"')
    ? headerActions
    : `${renderHeaderSearch()}${headerActions}`;
  return renderTemplate(headerTemplate, {
    ...values,
    headerActions: actionsWithSearch,
    genreMenu,
  });
}

export function renderFooter(values) {
  return renderTemplate(footerTemplate, values);
}

export function getPosterStyle(movie) {
  const images = [movie?.poster, movie?.backdrop].filter(
    (image) => typeof image === "string" && image.trim(),
  );
  return `background-image:${images.map((image) => `url('${image}')`).join(",")}`;
}

export function renderAccountActions() {
  const session = getSession();
  if (!session) return '<a class="login-link" href="/login.html">Đăng nhập</a>';

  const safeName = escapeHtml(session.name || "User");
  const initial = escapeHtml(session.name?.charAt(0).toUpperCase() || "U");
  const adminLink =
    session.role === "admin"
      ? '<a href="/admin/admin.html">Quản lý phim</a><a href="/admin/schedule.html">Quản lý lịch phát hành</a>'
      : "";
  const passwordLink =
    session.role === "user"
      ? '<a href="/account.html">Đổi mật khẩu</a>'
      : "";
  return `<details class="account-menu"><summary class="account-chip" aria-label="${safeName}" title="${safeName}"><span class="account-avatar">${initial}</span><span>${safeName}</span></summary><div class="account-dropdown">${adminLink}${passwordLink}<a href="/history.html">🕘 Lịch sử xem</a><a href="/favorites.html">♡ Phim yêu thích</a><button class="logout-button" id="logoutButton" type="button">↪ Đăng xuất</button></div></details>`;
}

export function bindAccountActions() {
  mountAssistantChat(getMovieDB());
  bindHeaderSearch();

  const genreNav = document.querySelector(".genre-nav");
  if (genreNav) {
    document.addEventListener("click", (event) => {
      if (!genreNav.contains(event.target)) genreNav.removeAttribute("open");
    });
  }

  document.querySelector("#logoutButton")?.addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "/login.html";
  });
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("vi")
    .trim();
}

export function bindHeaderSearch() {
  const form = document.querySelector("#headerSearch");
  const input = document.querySelector("#searchInput");
  const results = document.querySelector("#searchResults");
  if (!form || !input || !results) return;

  const movies = getMovieDB();
  const renderResults = (query = "") => {
    const normalizedQuery = normalizeSearchText(query);
    const matches = normalizedQuery
      ? movies.filter((movie) =>
          normalizeSearchText(movie.title).includes(normalizedQuery),
        )
      : [...movies].sort(
          (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
        );
    const suggestions = matches.slice(0, 6);

    if (!query.trim() && document.activeElement !== input) {
      form.classList.remove("has-results");
      return;
    }

    form.classList.add("has-results");
    results.innerHTML = suggestions.length
      ? suggestions
          .map(
            (movie) =>
              `<a class="search-result" href="/watch.html?id=${encodeURIComponent(movie.id)}">${escapeHtml(movie.title)}</a>`
          )
          .join("") +
        (normalizedQuery
          ? `<a class="search-result search-result-all" href="/search.html?q=${encodeURIComponent(query.trim())}">Xem tất cả kết quả →</a>`
          : "")
      : '<p class="search-empty">Không tìm thấy phim phù hợp.</p>';
  };

  input.addEventListener("focus", () => renderResults(input.value));
  input.addEventListener("input", () => renderResults(input.value));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (query) {
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  });
  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) form.classList.remove("has-results");
  });
}
