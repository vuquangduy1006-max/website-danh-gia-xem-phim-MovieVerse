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
        <p class="eyebrow">Quản trị</p>
        <h1>Quản lý người dùng</h1>
        <p>Xem, khóa hoặc xóa tài khoản người dùng đã đăng ký.</p>
      </div>
    </div>

    <div class="stats-grid" id="userStats"></div>

    <section class="admin-panel" style="margin-top:32px" aria-label="Danh sách người dùng">
      <div class="panel-head" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <h2 class="panel-title">Tài khoản đã đăng ký</h2>
          <p class="panel-desc">Danh sách người dùng tạo tài khoản qua trang đăng ký.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <label class="sr-only" for="userSearch">Tìm người dùng</label>
          <input id="userSearch" type="search" class="input-field" placeholder="Tìm tên hoặc email..." style="width:240px" autocomplete="off" />
          <select id="userFilter" class="input-field" style="width:160px">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Đã bị khóa</option>
          </select>
        </div>
      </div>

      <div id="userTableWrap" style="margin-top:20px;overflow-x:auto">
        <p class="panel-desc" id="loadingMsg">Đang tải danh sách người dùng...</p>
      </div>
    </section>
  </div>
</main>

<!-- Confirm delete dialog -->
<div class="modal-backdrop" id="deleteModal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
  <div class="modal">
    <h2 id="deleteModalTitle">Xác nhận xóa người dùng</h2>
    <p id="deleteModalBody">Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="cancelDeleteBtn">Hủy</button>
      <button class="btn btn-danger" id="confirmDeleteBtn">Xóa</button>
    </div>
  </div>
</div>
`;

// ---- State ----
let users = [];
let pendingDeleteId = null;

const session = getSession();
const adminToken = session?.adminToken;

// ---- Fetch users ----
async function loadUsers() {
  document.querySelector("#loadingMsg").textContent = "Đang tải danh sách người dùng...";
  document.querySelector("#loadingMsg").style.display = "";
  try {
    const resp = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");
    users = data.users || [];
    renderStats();
    renderTable();
  } catch (err) {
    document.querySelector("#loadingMsg").textContent = `Lỗi: ${err.message}`;
  }
}

// ---- Stats ----
function renderStats() {
  const total = users.length;
  const active = users.filter((u) => !u.blocked).length;
  const blocked = users.filter((u) => u.blocked).length;
  document.querySelector("#userStats").innerHTML = `
    <div class="stat-card"><p class="stat-value">${total}</p><p class="stat-label">Tổng người dùng</p></div>
    <div class="stat-card"><p class="stat-value" style="color:var(--green)">${active}</p><p class="stat-label">Đang hoạt động</p></div>
    <div class="stat-card"><p class="stat-value" style="color:var(--danger)">${blocked}</p><p class="stat-label">Đã bị khóa</p></div>
  `;
}

// ---- Table ----
function renderTable() {
  const query = document.querySelector("#userSearch").value.trim().toLowerCase();
  const filter = document.querySelector("#userFilter").value;
  const msg = document.querySelector("#loadingMsg");

  let filtered = users;
  if (query) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }
  if (filter === "active") filtered = filtered.filter((u) => !u.blocked);
  if (filter === "blocked") filtered = filtered.filter((u) => u.blocked);

  if (filtered.length === 0) {
    msg.textContent =
      users.length === 0
        ? "Chưa có người dùng nào đăng ký."
        : "Không tìm thấy người dùng phù hợp.";
    msg.style.display = "";
    document.querySelector("#userTableWrap").innerHTML = `<p class="panel-desc" id="loadingMsg">${msg.textContent}</p>`;
    return;
  }

  document.querySelector("#userTableWrap").innerHTML = `
    <table class="admin-table" style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)">Tên</th>
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)">Email</th>
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)">Ngày đăng ký</th>
          <th style="text-align:center;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)">Trạng thái</th>
          <th style="text-align:right;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)">Thao tác</th>
        </tr>
      </thead>
      <tbody id="userTbody">
        ${filtered
          .map(
            (u) => `
          <tr data-user-id="${escapeHtml(u.id)}" style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:12px;font-weight:500">${escapeHtml(u.name)}</td>
            <td style="padding:12px;color:var(--muted);font-size:13px">${escapeHtml(u.email)}</td>
            <td style="padding:12px;color:var(--muted);font-size:13px">${formatDate(u.createdAt)}</td>
            <td style="padding:12px;text-align:center">
              <span class="status-badge ${u.blocked ? "badge-hidden" : "badge-visible"}" style="font-size:11px">
                ${u.blocked ? "🔒 Đã khóa" : "✅ Hoạt động"}
              </span>
            </td>
            <td style="padding:12px;text-align:right">
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button
                  class="btn btn-secondary btn-sm"
                  style="font-size:12px;padding:5px 12px"
                  data-action="block"
                  data-id="${escapeHtml(u.id)}"
                  data-blocked="${u.blocked}"
                  title="${u.blocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}"
                >${u.blocked ? "Mở khóa" : "Khóa"}</button>
                <button
                  class="btn btn-danger btn-sm"
                  style="font-size:12px;padding:5px 12px"
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
    <p style="margin-top:12px;font-size:12px;color:var(--muted)">Hiển thị ${filtered.length} / ${users.length} người dùng</p>
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
    const resp = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ blocked: !currentlyBlocked }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");
    const user = users.find((u) => u.id === userId);
    if (user) user.blocked = data.blocked;
    renderStats();
    renderTable();
  } catch (err) {
    alert(`Lỗi: ${err.message}`);
    if (btn) {
      btn.disabled = false;
      btn.textContent = currentlyBlocked ? "Mở khóa" : "Khóa";
    }
  }
}

// ---- Delete ----
function showDeleteModal(userId, userName) {
  pendingDeleteId = userId;
  document.querySelector("#deleteModalBody").textContent =
    `Bạn có chắc muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`;
  document.querySelector("#deleteModal").style.display = "flex";
}

document.querySelector("#cancelDeleteBtn").addEventListener("click", () => {
  pendingDeleteId = null;
  document.querySelector("#deleteModal").style.display = "none";
});

document.querySelector("#confirmDeleteBtn").addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  const userId = pendingDeleteId;
  document.querySelector("#deleteModal").style.display = "none";
  pendingDeleteId = null;

  try {
    const resp = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Lỗi máy chủ.");
    users = users.filter((u) => u.id !== userId);
    renderStats();
    renderTable();
  } catch (err) {
    alert(`Lỗi: ${err.message}`);
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
