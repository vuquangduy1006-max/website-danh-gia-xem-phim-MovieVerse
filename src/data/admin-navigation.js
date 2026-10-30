const adminLinks = [
  { href: "/", label: "← Trang chủ" },
  { href: "/admin/admin.html", label: "Quản lý phim" },
  { href: "/admin/schedule.html", label: "Lịch phát hành" },
  { href: "/admin/genres.html", label: "Thể loại" },
  { href: "/admin/comments.html", label: "Bình luận" },
  { href: "/admin/users.html", label: "Người dùng" },
];

export function renderAdminHeader(activeHref) {
  const links = adminLinks
    .map(({ href, label }) => {
      const active = href === activeHref;
      return `<a href="${href}"${active ? ' class="active" aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");

  return `
    <header class="admin-header">
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="admin-nav" aria-label="Điều hướng quản trị">${links}</nav>
        <div class="header-actions"><span class="admin-role">ADMIN</span></div>
      </div>
    </header>
  `;
}
