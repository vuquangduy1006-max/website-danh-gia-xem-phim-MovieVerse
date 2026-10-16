const USERS_KEY = "movieverse_users";
const SESSION_KEY = "movieverse_session";
const DEFAULT_ADMIN_EMAIL = "admin@movieverse.local";

async function requestJson(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Không kết nối được máy chủ. Hãy thử lại sau.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Máy chủ trả về dữ liệu không hợp lệ. Hãy thử lại sau.");
  }
  return { response, payload };
}

function saveSession(session, remember) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readSession(storage) {
  try {
    const session = JSON.parse(storage.getItem(SESSION_KEY));
    if (!session || !session.id || !session.role) return null;
    if (session.expiresAt && Number(session.expiresAt) <= Date.now()) {
      storage.removeItem(SESSION_KEY);
      return null;
    }
    if (session.role === "user" && !session.token) return null;
    return session;
  } catch {
    return null;
  }
}

function readLegacyUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY));
    if (!Array.isArray(saved)) return [];

    const users = saved.filter(
      (user) =>
        user &&
        user.role === "user" &&
        typeof user.email === "string" &&
        typeof user.password === "string",
    );
    if (users.length !== saved.length) {
      if (users.length) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } else {
        localStorage.removeItem(USERS_KEY);
      }
    }
    return users;
  } catch {
    return [];
  }
}

function removeLegacyUser(email) {
  const remainingUsers = readLegacyUsers().filter(
    (user) => user.email.trim().toLowerCase() !== email,
  );
  if (remainingUsers.length) {
    localStorage.setItem(USERS_KEY, JSON.stringify(remainingUsers));
  } else {
    localStorage.removeItem(USERS_KEY);
  }
}

async function loginAdmin(email, password, remember) {
  let result;
  try {
    result = await requestJson("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    return { ok: false, message: error.message };
  }

  if (!result.response.ok) {
    return {
      ok: false,
      message: result.payload.error || "Không thể đăng nhập quản trị.",
    };
  }
  const session = {
    id: "admin-default",
    name: result.payload.name,
    email: result.payload.email,
    role: "admin",
    adminToken: result.payload.token,
    expiresAt: result.payload.expiresAt,
  };
  saveSession(session, remember);
  return { ok: true, session };
}

export async function registerUser({ name, email, password }) {
  let result;
  try {
    result = await requestJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch (error) {
    return { ok: false, message: error.message };
  }

  if (!result.response.ok) {
    return {
      ok: false,
      message: result.payload.error || "Không thể tạo tài khoản.",
    };
  }
  return { ok: true, user: result.payload.user };
}

export async function loginUser(email, password, remember = false) {
  const normalizedEmail = email.trim().toLowerCase();
  const legacyUsers = readLegacyUsers();
  if (normalizedEmail === DEFAULT_ADMIN_EMAIL) {
    return loginAdmin(normalizedEmail, password, remember);
  }

  const legacyUser = legacyUsers.find(
    (user) => user.email.trim().toLowerCase() === normalizedEmail,
  );

  let result;
  try {
    result = await requestJson("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        remember,
      }),
    });
  } catch (error) {
    return { ok: false, message: error.message };
  }

  if (result.response.status === 401 && legacyUser?.password === password) {
    const migration = await registerUser({
      name: legacyUser.name,
      email: normalizedEmail,
      password,
    });
    if (migration.ok) {
      removeLegacyUser(normalizedEmail);
      try {
        result = await requestJson("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            remember,
          }),
        });
      } catch (error) {
        return { ok: false, message: error.message };
      }
    } else if (migration.message === "Email này đã được đăng ký.") {
      return {
        ok: false,
        message:
          "Tài khoản cũ đã được chuyển trước đó. Hãy đăng nhập bằng mật khẩu đã dùng khi chuyển.",
      };
    } else if (
      migration.message !==
      "Email này không thể dùng để tạo tài khoản người dùng."
    ) {
      return migration;
    }
  }

  if (result.response.ok) {
    const user = result.payload.user;
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: result.payload.token,
      expiresAt: result.payload.expiresAt,
    };
    removeLegacyUser(normalizedEmail);
    saveSession(session, remember);
    return { ok: true, session };
  }

  if (result.response.status === 401) {
    const adminResult = await loginAdmin(normalizedEmail, password, remember);
    if (adminResult.ok) return adminResult;
  }
  return {
    ok: false,
    message: result.payload.error || "Email hoặc mật khẩu không đúng.",
  };
}

export function getSession() {
  return readSession(localStorage) || readSession(sessionStorage);
}

export function isAdmin() {
  return getSession()?.role === "admin";
}

export async function logoutUser() {
  const session = getSession();
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  const token = session?.adminToken || session?.token;
  if (!token) return;

  const endpoint =
    session.role === "admin"
      ? "/api/admin/session"
      : "/api/auth/session";
  try {
    const { response } = await requestJson(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Máy chủ không thể thu hồi phiên đăng nhập.");
    }
  } catch (error) {
    console.error("Không thể thu hồi phiên đăng nhập trên máy chủ:", error);
  }
}
