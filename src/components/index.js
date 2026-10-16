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
  return renderTemplate(headerTemplate, { ...values, genreMenu });
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
      ? '<a href="/admin/admin.html">Quản lý phim</a>'
      : "";
  return `<details class="account-menu"><summary class="account-chip"><span class="account-avatar">${initial}</span><span>${safeName}</span></summary><div class="account-dropdown">${adminLink}<a href="/history.html">🕘 Lịch sử xem</a><a href="/favorites.html">♡ Phim yêu thích</a><button class="logout-button" id="logoutButton" type="button">↪ Đăng xuất</button></div></details>`;
}

export function bindAccountActions() {
  mountAssistantChat(getMovieDB());

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
