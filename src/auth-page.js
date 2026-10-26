import { loginUser, registerUser } from "./data/auth.js";
import { setupPasswordToggle } from "./password-toggle.js";

const form = document.querySelector(".auth-form");
setupPasswordToggle();

function safeNext(role) {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  if (next.startsWith("/admin/") && role !== "admin") return null;
  return next;
}

if (form) {
  const message = document.createElement("p");
  message.className = "auth-message";
  message.setAttribute("aria-live", "polite");
  form.append(message);

  const isRegister = Boolean(document.querySelector("#registerName"));
  const notice = localStorage.getItem("movieverse_auth_notice");
  if (!isRegister && notice) {
    message.textContent = notice;
    localStorage.removeItem("movieverse_auth_notice");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    let result;
    try {
      result = isRegister
        ? await registerUser({
            name: String(data.get("name") || ""),
            email: String(data.get("email") || ""),
            password: String(data.get("password") || ""),
          })
        : await loginUser(
            String(data.get("email") || ""),
            String(data.get("password") || ""),
            data.get("remember") === "on",
          );
    } catch (error) {
      result = {
        ok: false,
        message: error.message || "Không thể xử lý yêu cầu tài khoản.",
      };
    } finally {
      submitButton.disabled = false;
    }

    message.textContent = result.ok
      ? isRegister
        ? "Tạo tài khoản thành công. Đang chuyển đến đăng nhập..."
        : `Xin chào ${result.session.name}. Đang mở MovieVerse...`
      : result.message;
    message.classList.toggle("is-error", !result.ok);

    if (result.ok) {
      if (isRegister) {
        localStorage.setItem(
          "movieverse_auth_notice",
          "Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.",
        );
      }
      window.setTimeout(() => {
        window.location.href = isRegister
          ? "/login.html"
          : (safeNext(result.session.role) ??
            (result.session.role === "admin" ? "/admin/admin.html" : "/"));
      }, 450);
    }
  });
}
