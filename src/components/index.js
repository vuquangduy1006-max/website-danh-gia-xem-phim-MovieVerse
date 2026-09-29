import footerTemplate from "./footer.html?raw";
import headerTemplate from "./header.html?raw";
import { getSession, logoutUser } from "../data/auth.js";

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");
}

export function renderHeader(values) {
  return renderTemplate(headerTemplate, values);
}

export function renderFooter(values) {
  return renderTemplate(footerTemplate, values);
}

export function renderAccountActions() {
  const session = getSession();
  if (!session) return '<a class="login-link" href="/login.html">Đăng nhập</a>';
  const initial = session.name?.charAt(0).toUpperCase() || "U";
  return `<span class="account-chip"><span class="account-avatar">${initial}</span><span>${session.name}</span></span><button class="logout-button" id="logoutButton" type="button">Đăng xuất</button>`;
}

export function bindAccountActions() {
  document.querySelector("#logoutButton")?.addEventListener("click", () => {
    logoutUser();
    window.location.href = "/login.html";
  });
}
