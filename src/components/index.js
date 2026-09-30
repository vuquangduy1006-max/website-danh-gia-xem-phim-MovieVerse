import footerTemplate from "./footer.html?raw";
import headerTemplate from "./header.html?raw";
import { getSession, logoutUser } from "../data/auth.js";
import { genreList } from "../data/data.js";

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");
}

export function renderHeader(values) {
  const genreMenu = genreList
    .map(
      (genre) => `<a href="/?genre=${encodeURIComponent(genre)}">${genre}</a>`,
    )
    .join("");
  return renderTemplate(headerTemplate, { ...values, genreMenu });
}

export function renderFooter(values) {
  return renderTemplate(footerTemplate, values);
}

export function renderAccountActions() {
  const session = getSession();
  if (!session) return '<a class="login-link" href="/login.html">Đăng nhập</a>';
  const initial = session.name?.charAt(0).toUpperCase() || "U";
  const adminLink = session.role === "admin" ? '<a href="/admin/admin.html">Quản lý phim</a>' : "";
  return `<details class="account-menu"><summary class="account-chip"><span class="account-avatar">${initial}</span><span>${session.name}</span></summary><div class="account-dropdown">${adminLink}<a href="/favorites.html">♡ Phim yêu thích</a><button class="logout-button" id="logoutButton" type="button">↪ Đăng xuất</button></div></details>`;
}

export function bindAccountActions() {
  document.querySelector("#logoutButton")?.addEventListener("click", () => {
    logoutUser();
    window.location.href = "/login.html";
  });
}
