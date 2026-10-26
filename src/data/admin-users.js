import "../admin/admin.css";
import "./auth.js";
import { getSession, isAdmin } from "./auth.js";

if (!isAdmin()) {
  window.location.replace("/login.html?next=/admin/users.html");
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- Render shell ----
document.querySelector("#app").innerHTML = `
<header class="admin-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
    <nav class="admin-nav" aria-label="Điều hướng quản trị">
      <a href="/" class="back-link">← Trang chủ</a>
      <a href="/admin/admin.html">Quản lý phim</a>
      <a href="/admin/schedule.html">Lịch phát hành</a>
      <a href="/admin/genres.html">Thể loại</a>
      <a href="/admin/comments.html">Bình luận</a>
      <a class="active" href="/admin/users.html">Người dùng</a>
    </nav>
    <div class="header-actions" style="margin-left:auto">
      <button class="btn btn-secondary" id="refreshBtn">↻ Tải lại</button>
    </div>
  </div>
</header>

<main class="admin-main">
  <div class="container">
    <div class="admin-heading">
      <div>
        <p class="eyebrow">Quản trị người dùng</p>
        <h1>Quản lý người dùng</h1>
        <p>Xem, quản lý trạng thái hoạt động hoặc xóa tài khoản thành viên.</p>
      </div>
    </div>

    <div class="stats-grid" id="userStats"></div>

    <section class="admin-panel" style="margin-top:32px" aria-label="Danh sách người dùng">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Tài khoản đã đăng ký</h2>
          <p class="panel-desc">Danh sách tài khoản người dùng đăng ký qua MovieVerse.</p>
        </div>
      </div>
      <div class="panel-toolbar user-toolbar">
        <div class="user-search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <label class="sr-only" for="userSearch">Tìm kiếm theo tên hoặc email</label>
          <input id="userSearch" type="search" class="toolbar-input" placeholder="Tìm kiếm theo tên hoặc email..." autocomplete="off" />
        </div>
        <label class="sr-only" for="userFilter">Lọc theo trạng thái</label>
        <select id="userFilter" class="toolbar-select" aria-label="Lọc theo trạng thái người dùng">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="blocked">Đã bị khóa</option>
        </select>
      </div>

      <div id="userTableWrap" style="overflow-x:auto">
        <p class="panel-desc" id="loadingMsg" style="padding:28px 24px;margin:0">Đang tải danh sách người dùng...</p>
      </div>
    </section>
  </div>
</main>

<!-- Confirm delete dialog -->
<div class="overlay" id="deleteOverlay" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
  <div class="confirm-card">
    <div class="confirm-icon">!</div>
    <h3 id="deleteModalTitle">Xác nhận xóa người dùng</h3>
    <p id="deleteModalBody">Bạn có chắc muốn xóa người dùng này? Hành động này sẽ xóa hoàn toàn tài khoản khỏi hệ thống và không thể hoàn tác.</p>
    <div class="confirm-actions">
      <button type="button" class="btn btn-ghost" id="cancelDeleteBtn">Hủy</button>
      <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Xóa người dùng</button>
    </div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

// ---- State ----
let users = [];
let pendingDeleteId = null;
let toastTimeout;

function getAdminToken() {
  const session = getSession();
  return session?.adminToken || session?.token || "";
}

function showToast(message, type = "success") {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.className = "toast";
  }, 2800);
}

// ---- Fetch users ----
async function loadUsers() {
  const wrap = document.querySelector("#userTableWrap");
  if (!wrap) return;
  wrap.innerHTML = `<p class="panel-desc" id="loadingMsg" style="padding:28px 24px;margin:0">Đang tải danh sách người dùng...</p>`;

  try {
    const token = getAdminToken();
    if (!token) throw new Error("Phiên quản trị không hợp lệ. Vui lòng đăng nhập lại.");

    const resp = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");
    users = data.users || [];
    renderStats();
    renderTable();
  } catch (err) {
    wrap.innerHTML = `<p class="panel-desc" style="padding:28px 24px;margin:0;color:var(--danger)">Lỗi tải dữ liệu: ${escapeHtml(err.message)}</p>`;
    showToast(`Lỗi: ${err.message}`, "error");
  }
}

// ---- Stats ----
function renderStats() {
  const total = users.length;
  const active = users.filter((u) => !u.blocked).length;
  const blocked = users.filter((u) => u.blocked).length;
  const statsContainer = document.querySelector("#userStats");
  if (!statsContainer) return;
  statsContainer.innerHTML = `
    <div class="stat-card"><p class="stat-value">${total}</p><p class="stat-label">Tổng người dùng</p></div>
    <div class="stat-card"><p class="stat-value" style="color:var(--green)">${active}</p><p class="stat-label">Đang hoạt động</p></div>
    <div class="stat-card"><p class="stat-value" style="color:var(--danger)">${blocked}</p><p class="stat-label">Đã bị khóa</p></div>
  `;
}

// ---- Table ----
function renderTable() {
  const searchInput = document.querySelector("#userSearch");
  const filterSelect = document.querySelector("#userFilter");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const filter = filterSelect ? filterSelect.value : "all";
  const wrap = document.querySelector("#userTableWrap");
  if (!wrap) return;

  let filtered = users;
  if (query) {
    filtered = filtered.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)),
    );
  }
  if (filter === "active") filtered = filtered.filter((u) => !u.blocked);
  if (filter === "blocked") filtered = filtered.filter((u) => u.blocked);

  if (filtered.length === 0) {
    const isNoUsers = users.length === 0;
    wrap.innerHTML = `
      <div class="empty-state">
        <h3>${isNoUsers ? "Chưa có người dùng nào đăng ký" : "Không tìm thấy người dùng phù hợp"}</h3>
        <p>${isNoUsers ? "Người dùng tạo tài khoản mới sẽ tự động hiển thị ở đây." : "Hãy thử thay đổi từ khóa tìm kiếm hoặc trạng thái lọc."}</p>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="movie-table user-admin-table" style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th>Tên người dùng</th>
          <th>Email</th>
          <th>Ngày đăng ký</th>
          <th style="text-align:center">Trạng thái</th>
          <th style="text-align:right">Thao tác</th>
        </tr>
      </thead>
      <tbody id="userTbody">
        ${filtered
          .map(
            (u) => `
          <tr data-user-id="${escapeHtml(u.id)}">
            <td style="font-weight:600;color:var(--text)">${escapeHtml(u.name)}</td>
            <td style="color:var(--muted)">${escapeHtml(u.email)}</td>
            <td style="color:var(--muted);font-size:13px">${formatDate(u.createdAt)}</td>
            <td style="text-align:center">
              <span class="status-badge ${u.blocked ? "badge-hidden" : "badge-visible"}">
                ${u.blocked ? "🔒 Đã khóa" : "✅ Hoạt động"}
              </span>
            </td>
            <td style="text-align:right">
              <div class="row-actions">
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  data-action="block"
                  data-id="${escapeHtml(u.id)}"
                  data-blocked="${u.blocked}"
                  title="${u.blocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}"
                >${u.blocked ? "Mở khóa" : "Khóa"}</button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  data-action="delete"
                  data-id="${escapeHtml(u.id)}"
                  data-name="${escapeHtml(u.name)}"
                  title="Xóa người dùng"
                >Xóa</button>
              </div>
            </td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <div style="padding:14px 24px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);display:flex;justify-content:space-between;align-items:center">
      <span>Hiển thị <strong>${filtered.length}</strong> / <strong>${users.length}</strong> người dùng</span>
    </div>
  `;
}

// ---- Block / Unblock ----
async function toggleBlock(userId, currentlyBlocked) {
  const btn = document.querySelector(`[data-action="block"][data-id="${userId}"]`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";
  }
  try {
    const token = getAdminToken();
    if (!token) throw new Error("Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.");

    const resp = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blocked: !currentlyBlocked }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");
    const user = users.find((u) => u.id === userId);
    if (user) user.blocked = data.blocked;
    renderStats();
    renderTable();
    showToast(
      data.blocked
        ? `Đã khóa tài khoản "${user?.name || userId}".`
        : `Đã mở khóa tài khoản "${user?.name || userId}".`,
      "success",
    );
  } catch (err) {
    showToast(`Lỗi: ${err.message}`, "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = currentlyBlocked ? "Mở khóa" : "Khóa";
    }
  }
}

// ---- Delete ----
function showDeleteModal(userId, userName) {
  pendingDeleteId = userId;
  const bodyEl = document.querySelector("#deleteModalBody");
  if (bodyEl) {
    bodyEl.textContent = `Bạn có chắc muốn xóa người dùng "${userName}"? Hành động này sẽ xóa hoàn toàn tài khoản khỏi hệ thống và không thể hoàn tác.`;
  }
  const overlay = document.querySelector("#deleteOverlay");
  if (overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }
}

function hideDeleteModal() {
  pendingDeleteId = null;
  const overlay = document.querySelector("#deleteOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
}

document.querySelector("#cancelDeleteBtn").addEventListener("click", hideDeleteModal);

document.querySelector("#deleteOverlay").addEventListener("click", (e) => {
  if (e.target.id === "deleteOverlay") hideDeleteModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector("#deleteOverlay")?.classList.contains("open")) {
    hideDeleteModal();
  }
});

document.querySelector("#confirmDeleteBtn").addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  const userId = pendingDeleteId;
  const btn = document.querySelector("#confirmDeleteBtn");
  btn.disabled = true;
  btn.textContent = "Đang xóa...";

  try {
    const token = getAdminToken();
    if (!token) throw new Error("Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.");

    const resp = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");

    const deletedUser = users.find((u) => u.id === userId);
    users = users.filter((u) => u.id !== userId);
    hideDeleteModal();
    renderStats();
    renderTable();
    showToast(`Đã xóa người dùng "${deletedUser?.name || userId}" thành công.`, "success");
  } catch (err) {
    showToast(`Lỗi: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Xóa người dùng";
  }
});

// ---- Event delegation ----
document.querySelector("#app").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id, blocked, name } = btn.dataset;
  if (action === "block") toggleBlock(id, blocked === "true");
  if (action === "delete") showDeleteModal(id, name);
});

document.querySelector("#userSearch").addEventListener("input", renderTable);
document.querySelector("#userFilter").addEventListener("change", renderTable);
document.querySelector("#refreshBtn").addEventListener("click", loadUsers);

// ---- Init ----
loadUsers();
