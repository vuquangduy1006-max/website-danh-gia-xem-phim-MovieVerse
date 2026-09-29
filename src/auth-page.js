import { loginUser, registerUser } from "./data/auth.js";

const form = document.querySelector(".auth-form");
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const result = isRegister
      ? registerUser({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          password: String(data.get("password") || ""),
        })
      : loginUser(String(data.get("email") || ""), String(data.get("password") || ""));

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
          : result.session.role === "admin"
            ? "/admin/admin.html"
            : "/";
      }, 450);
    }
  });
}
