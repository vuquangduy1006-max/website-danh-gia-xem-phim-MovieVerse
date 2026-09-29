import { loginUser, registerUser } from "./data/auth.js";

const form = document.querySelector(".auth-form");
if (form) {
  const message = document.createElement("p");
  message.className = "auth-message";
  message.setAttribute("aria-live", "polite");
  form.append(message);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const isRegister = Boolean(document.querySelector("#registerName"));
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
