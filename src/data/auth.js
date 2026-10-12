const USERS_KEY = "movieverse_users";
const SESSION_KEY = "movieverse_session";
const DEFAULT_ADMIN = {
  id: "admin-default",
  name: "MovieVerse Admin",
  email: "admin@movieverse.local",
  password: "admin123",
  role: "admin",
};

function loadUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (_) {}
  const users = [DEFAULT_ADMIN];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

export function registerUser({ name, email, password }) {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) {
    return { ok: false, message: "Email này đã được đăng ký." };
  }
  const user = {
    id: `user-${Date.now().toString(36)}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "user",
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, user };
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const localUser = loadUsers().find((item) => item.email === normalizedEmail);
  if (normalizedEmail === DEFAULT_ADMIN.email || !localUser) {
    let response;
    let result;
    try {
      response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      result = await response.json();
    } catch {
      return {
        ok: false,
        message: "Không kết nối được máy chủ quản trị. Hãy thử lại sau.",
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        message: result.error || "Không thể đăng nhập quản trị.",
      };
    }
    const session = {
      id: "admin-default",
      name: result.name,
      email: result.email,
      role: "admin",
      adminToken: result.token,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  const user = localUser.password === password ? localUser : null;
  if (!user) return { ok: false, message: "Email hoặc mật khẩu không đúng." };
  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session && session.id && session.role ? session : null;
  } catch (_) {
    return null;
  }
}

export function isAdmin() {
  return getSession()?.role === "admin";
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
