import footerTemplate from "./footer.html?raw";
import headerTemplate from "./header.html?raw";
import { getSession, logoutUser } from "../data/auth.js";
import { getGenreList, getMovieDB, getMovieGenres } from "../data/data.js";
import { mountAssistantChat } from "../assistant-chat.js";

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function renderHeaderSearch() {
  return `<form class="header-search" id="headerSearch" role="search">
  <label class="sr-only" for="searchInput">Tìm phim</label>
  <input id="searchInput" type="search" placeholder="Tìm phim..." autocomplete="off" aria-controls="searchResults">
  <button class="header-search-button" type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">⌕</button>
  <div class="search-results" id="searchResults" aria-live="polite"></div>
</form>`;
}

export function renderHeader(values) {
  const availableGenres = [
    ...new Set(getMovieDB().flatMap(getMovieGenres)),
  ].sort((a, b) => a.localeCompare(b, "vi"));
  const genreMenu = availableGenres
    .map(
      (genre) =>
        `<a href="/genres.html?genre=${encodeURIComponent(genre)}">${genre}</a>`,
    )
    .join("");
  const headerActions = values.headerActions || "";
  const actionsWithSearch = headerActions.includes('class="header-search"')
    ? headerActions
    : `${renderHeaderSearch()}${headerActions}`;
  return renderTemplate(headerTemplate, {
    ...values,
    headerActions: actionsWithSearch,
    genreMenu,
  });
}

export function renderFooter(values) {
  return renderTemplate(footerTemplate, values);
}

export function getPosterStyle(movie) {
  const images = [movie?.poster, movie?.backdrop].filter(
    (image) => typeof image === "string" && image.trim(),
  );
  return `background-image:${images.map((image) => `url('${image}')`).join(",")}`;
}

 
export async function updateNotificationCount() {
  const bell = document.querySelector(".notification-bell");
  const badge = bell?.querySelector(".notification-count");

  if (!badge) return;

  const session = getSession();

  if (!session?.token) {
    badge.hidden = true;
    return;
  }

  try {
    const response = await fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const notifications = Array.isArray(data.notifications)
      ? data.notifications
      : [];

    const count = notifications.filter(
  (notification) => !notification.read
).length;

    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count === 0;
  } catch (error) {
    console.error("Không thể tải số thông báo:", error);
    badge.hidden = true;
  }
}

export function renderAccountActions() {
  const session = getSession();

  if (!session) {
    return '<a class="login-link" href="/login.html">Đăng nhập</a>';
  }

  const safeName = escapeHtml(session.name || "User");
  const initial = escapeHtml(
    session.name?.charAt(0).toUpperCase() || "U"
  );

  const adminLink =
    session.role === "admin"
      ? '<a href="/admin/admin.html">Quản lý phim</a><a href="/admin/schedule.html">Quản lý lịch phát hành</a>'
      : "";

  const notificationContainer = `
    <div class="notification-container">
      <button
        type="button"
        class="notification-bell"
        id="notificationBellBtn"
        aria-label="Thông báo"
        title="Thông báo"
        aria-expanded="false"
        aria-haspopup="true"
      >
        <svg class="bell-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notification-count" hidden></span>
      </button>

      <div class="notification-dropdown" id="notificationDropdown" role="region" aria-label="Khung thông báo" hidden>
        <div class="notification-header">
          <h3 class="notification-heading">Thông báo</h3>
          <button type="button" class="notification-mark-all" id="notificationMarkAllBtn">Đánh dấu đã đọc</button>
        </div>
        <div class="notification-body" id="notificationDropdownList">
          <div class="notification-empty">Bạn chưa có thông báo nào.</div>
        </div>
      </div>
    </div>
  `;

  const passwordLink =
    session.role === "user"
      ? '<a href="/account.html">Hồ sơ cá nhân</a>'
      : "";

  const notificationLink =
    '<button type="button" class="notification-trigger-btn" id="accountNotificationBtn">🔔 Thông báo bình luận</button>';

  return `${notificationContainer}<details class="account-menu">
      <summary class="account-chip" aria-label="${safeName}" title="${safeName}">
        <span class="account-avatar">${initial}</span>
        <span>${safeName}</span>
      </summary>

      <div class="account-dropdown">
        ${adminLink}
        ${passwordLink}
        ${notificationLink}
        <a href="/history.html">🕘 Lịch sử xem</a>
        <a href="/favorites.html">♡ Phim yêu thích</a>
        <button class="logout-button" id="logoutButton" type="button">
          ↪ Đăng xuất
        </button>
      </div>
    </details>
  `;
}

export function bindNotificationDropdown() {
  const container = document.querySelector(".notification-container");
  const bellBtn = document.querySelector("#notificationBellBtn");
  const dropdown = document.querySelector("#notificationDropdown");
  const listEl = document.querySelector("#notificationDropdownList");
  const markAllBtn = document.querySelector("#notificationMarkAllBtn");
  const accountTriggerBtn = document.querySelector("#accountNotificationBtn");
  const accountMenu = document.querySelector(".account-menu");

  if (!container || !bellBtn || !dropdown || !listEl) return;

  let isFetching = false;

  async function fetchAndRenderNotifications() {
    const session = getSession();
    if (!session?.token) {
      listEl.innerHTML = '<div class="notification-empty">Vui lòng đăng nhập để xem thông báo.</div>';
      return;
    }

    if (isFetching) return;
    isFetching = true;

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const notifications = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      const unreadCount = notifications.filter((n) => !n.read).length;
      const badge = bellBtn.querySelector(".notification-count");
      if (badge) {
        badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        badge.hidden = unreadCount === 0;
      }

      if (notifications.length === 0) {
        listEl.innerHTML = '<div class="notification-empty">Bạn chưa có thông báo nào.</div>';
        if (markAllBtn) markAllBtn.disabled = true;
        return;
      }

      if (markAllBtn) {
        markAllBtn.disabled = unreadCount === 0;
      }

      const movies = getMovieDB();

      listEl.innerHTML = notifications
        .map((notification) => {
          const author = escapeHtml(notification.author || "Người dùng");
          const movieTitle = escapeHtml(notification.movieTitle || "");
          const comment = escapeHtml(notification.comment || "");
          const date = escapeHtml(notification.date || "");
          const isUnread = !notification.read;

          return `
            <div class="notification-item ${isUnread ? "unread" : "read"}" role="button" tabindex="0" data-movie="${movieTitle}">
              <div class="notification-item-icon" aria-hidden="true">💬</div>
              <div class="notification-item-content">
                <div class="notification-item-title">
                  <strong>${author}</strong> đã trả lời bình luận của bạn
                </div>
                ${movieTitle ? `<div class="notification-item-movie">Phim: <span>${movieTitle}</span></div>` : ""}
                ${comment ? `<div class="notification-item-comment">${comment}</div>` : ""}
                <div class="notification-item-meta">
                  <span class="notification-item-time">${date}</span>
                  ${isUnread ? '<span class="notification-item-unread-dot" title="Chưa đọc"></span>' : ""}
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      listEl.querySelectorAll(".notification-item").forEach((item) => {
        const handleOpen = () => {
          const title = item.dataset.movie;
          if (title) {
            const matched = movies.find(
              (m) =>
                m.title?.toLowerCase() === title.toLowerCase() ||
                m.vietnameseTitle?.toLowerCase() === title.toLowerCase()
            );
            if (matched?.id) {
              window.location.href = `/movie-detail.html?id=${encodeURIComponent(matched.id)}`;
              return;
            }
            window.location.href = `/search.html?q=${encodeURIComponent(title)}`;
          }
        };

        item.addEventListener("click", handleOpen);
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        });
      });
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      listEl.innerHTML = '<div class="notification-empty">Không thể tải thông báo. Vui lòng thử lại sau.</div>';
    } finally {
      isFetching = false;
    }
  }

  function toggleDropdown(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : dropdown.hidden;
    dropdown.hidden = !shouldOpen;
    bellBtn.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen) {
      if (accountMenu) accountMenu.removeAttribute("open");
      fetchAndRenderNotifications();
    }
  }

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  if (accountTriggerBtn) {
    accountTriggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (accountMenu) accountMenu.removeAttribute("open");
      toggleDropdown(true);
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const session = getSession();
      if (!session?.token) return;

      try {
        markAllBtn.disabled = true;
        const res = await fetch("/api/notifications/read", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (res.ok) {
          const badge = bellBtn.querySelector(".notification-count");
          if (badge) {
            badge.hidden = true;
            badge.textContent = "";
          }

          listEl.querySelectorAll(".notification-item.unread").forEach((item) => {
            item.classList.remove("unread");
            item.classList.add("read");
            item.querySelector(".notification-item-unread-dot")?.remove();
          });
        }
      } catch (err) {
        console.error("Lỗi khi đánh dấu thông báo đã đọc:", err);
      } finally {
        markAllBtn.disabled = false;
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (!dropdown.hidden && !container.contains(event.target)) {
      dropdown.hidden = true;
      bellBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dropdown.hidden) {
      dropdown.hidden = true;
      bellBtn.setAttribute("aria-expanded", "false");
      bellBtn.focus();
    }
  });
}

export function bindAccountActions() {
  mountAssistantChat(getMovieDB());
  bindHeaderSearch();
  bindNotificationDropdown();
  updateNotificationCount();
  initScrollProgressBar();

  const genreNav = document.querySelector(".genre-nav");
  if (genreNav) {
    document.addEventListener("click", (event) => {
      if (!genreNav.contains(event.target)) genreNav.removeAttribute("open");
    });
  }

  document.querySelector("#logoutButton")?.addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "/login.html";
  });
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("vi")
    .trim();
}

const RECENT_SEARCHES_KEY = "movieverse_recent_searches";

const POPULAR_GENRES = [
  {
    genre: "Hành động",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    hot: true,
  },
  {
    genre: "Hoạt hình",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    hot: true,
  },
  {
    genre: "Khoa học viễn tưởng",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/><circle cx="12" cy="12" r="6"/></svg>`,
    hot: true,
  },
  {
    genre: "Phiêu lưu",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    hot: true,
  },
  {
    genre: "Kinh dị",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01m5.99 0h.01M9 16a3 3 0 0 0 6 0"/></svg>`,
    hot: true,
  },
  {
    genre: "Tình cảm",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    hot: true,
  },
  {
    genre: "Hài",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    hot: true,
  },
  {
    genre: "Tâm lý",
    icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6m-6 4h6m-6 4h4"/></svg>`,
    hot: true,
  },
];

function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return ["Hành động", "Hoạt hình"];
}

function saveRecentSearches(list) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch (_) {}
}

function addRecentSearch(item) {
  const clean = String(item ?? "").trim();
  if (!clean) return;
  const list = getRecentSearches().filter(
    (s) => s.toLowerCase() !== clean.toLowerCase(),
  );
  list.unshift(clean);
  saveRecentSearches(list.slice(0, 6));
}

function removeRecentSearch(item) {
  const list = getRecentSearches().filter((s) => s !== item);
  saveRecentSearches(list);
}

function clearRecentSearches() {
  saveRecentSearches([]);
}

function renderDefaultState() {
  const recents = getRecentSearches();
  const recentHtml = recents.length
    ? `<div class="search-section search-section-recent">
        <div class="search-section-header">
          <span class="search-section-title">
            <svg class="search-section-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            GẦN ĐÂY
          </span>
          <button type="button" class="search-clear-all-btn" title="Xóa tất cả lịch sử" aria-label="Xóa tất cả">✕</button>
        </div>
        <div class="search-recent-list">
          ${recents
            .map(
              (item) => `
            <div class="search-recent-item" data-query="${escapeHtml(item)}">
              <span class="search-recent-left">
                <svg class="search-recent-clock" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="search-recent-text">${escapeHtml(item)}</span>
              </span>
              <button type="button" class="search-recent-delete" data-delete-query="${escapeHtml(item)}" title="Xóa" aria-label="Xóa">✕</button>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>`
    : "";

  const popularHtml = `
    <div class="search-section search-section-popular">
      <div class="search-section-header">
        <span class="search-section-title search-popular-title">
          <span class="search-flame-icon" aria-hidden="true">🔥</span>
          THỂ LOẠI PHỔ BIẾN
        </span>
      </div>
      <div class="search-popular-list">
        ${POPULAR_GENRES.map(
          (p) => `
          <button type="button" class="search-popular-item" data-query="${escapeHtml(p.genre)}">
            <span class="search-popular-left">
              <span class="search-popular-icon">${p.icon}</span>
              <span class="search-popular-text">${escapeHtml(p.genre)}</span>
            </span>
            <span class="search-hot-badge">HOT</span>
          </button>
        `,
        ).join("")}
      </div>
    </div>
  `;

  return recentHtml + popularHtml;
}


export function renderMovieCards(matches, query) {
  if (!matches.length) {
    return '<p class="search-empty">Không tìm thấy phim phù hợp.</p>';
  }

  const cardsHtml = matches
    .slice(0, 6)
    .map((movie) => {
      const genres = getMovieGenres(movie);
      const primaryGenre = genres[0] || movie.genre || "Phim";
      const isAnimeOrAnimation =
        /hoạt hình|anime/i.test(primaryGenre) ||
        /hoạt hình|anime/i.test(movie.genre || "");
      const rawEpisodeCount = Number(movie.episodeCount ?? 0);
      const episodeCount =
        rawEpisodeCount > 0
          ? rawEpisodeCount
          : Array.isArray(movie.episodes) && movie.episodes.length > 0
            ? movie.episodes.length
            : 1;
      const isSeries = episodeCount > 1 || isAnimeOrAnimation;

      const badgeText = isSeries ? "Phim bộ" : "Phim lẻ";
      const badgeClass = isSeries ? "badge-series" : "badge-movie";

      const subTitle =
        movie.originalTitle ||
        movie.englishTitle ||
        movie.subTitle ||
        movie.title;

      const extraLine =
        episodeCount > 1 ? `${episodeCount} tập` : "Phim lẻ";

      const posterUrl = movie.poster || movie.backdrop || "";

      return `
        <a class="search-result search-result-card"
           href="/movie-detail.html?id=${encodeURIComponent(movie.id)}"
           data-movie-id="${encodeURIComponent(movie.id)}">
          <div class="search-card-poster">
            ${
              posterUrl
                ? `<img src="${escapeHtml(posterUrl)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">`
                : ""
            }
            <div class="search-poster-placeholder" style="${posterUrl ? "display:none;" : "display:flex;"}" aria-hidden="true">🎬</div>
          </div>
          <div class="search-card-info">
            <div class="search-card-title">${escapeHtml(movie.title)}</div>
            <div class="search-card-sub">${escapeHtml(subTitle)}</div>
            <div class="search-card-meta">
              <span class="search-card-badge ${badgeClass}">${badgeText}</span>
              <span class="search-card-year">${escapeHtml(String(movie.year || "").slice(0, 4))}</span>
              <span class="search-card-genre">${escapeHtml(primaryGenre)}</span>
            </div>
            <div class="search-card-extra">${escapeHtml(extraLine)}</div>
          </div>
        </a>
      `;
    })
    .join("");

  return cardsHtml;
}


export function bindHeaderSearch() {
  const form = document.querySelector("#headerSearch");
  const input = document.querySelector("#searchInput");
  const results = document.querySelector("#searchResults");
  if (!form || !input || !results) return;

  const movies = getMovieDB();

  const updateDropdown = () => {
    const rawVal = input.value;
    const trimmed = rawVal.trim();
    form.classList.add("has-results");

    if (!trimmed) {
      results.innerHTML = renderDefaultState();
    } else {
      const normalizedQuery = normalizeSearchText(trimmed);
      const matches = movies.filter((movie) => {
        const titleNorm = normalizeSearchText(movie.title);
        const origNorm = normalizeSearchText(
          movie.originalTitle || movie.englishTitle || "",
        );
        const descNorm = normalizeSearchText(movie.description || "");
        const genreNorm = normalizeSearchText(getMovieGenres(movie).join(" "));
        return (
          titleNorm.includes(normalizedQuery) ||
          origNorm.includes(normalizedQuery) ||
          descNorm.includes(normalizedQuery) ||
          genreNorm.includes(normalizedQuery)
        );
      });

      matches.sort((a, b) => {
        const aStart = normalizeSearchText(a.title).startsWith(normalizedQuery);
        const bStart = normalizeSearchText(b.title).startsWith(normalizedQuery);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return Number(b.rating || 0) - Number(a.rating || 0);
      });

      results.innerHTML = renderMovieCards(matches, trimmed);
    }
  };

  input.addEventListener("focus", () => updateDropdown());
  input.addEventListener("input", () => updateDropdown());

  
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  const keyword = normalizeSearchText(query);

  const selectedGenre = getGenreList().find(
    (genre) => normalizeSearchText(genre) === keyword
  );

  if (selectedGenre) {
    addRecentSearch(query);
    window.location.href =
      `/genres.html?genre=${encodeURIComponent(selectedGenre)}`;
    return;
  }

  const exactMovie = movies.find(
    (movie) => normalizeSearchText(movie.title) === keyword
  );

  const matchingMovies = movies.filter(
    (movie) => normalizeSearchText(movie.title).includes(keyword)
  );

  const selectedMovie = exactMovie || matchingMovies[0];

  if (selectedMovie) {
    addRecentSearch(query);
    window.location.href =
      `/movie-detail.html?id=${encodeURIComponent(selectedMovie.id)}`;
    return;
  }

  alert("Không tìm thấy phim hoặc thể loại phù hợp!");
});


  results.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest("[data-delete-query]");
    if (deleteBtn) {
      event.preventDefault();
      event.stopPropagation();
      const q = deleteBtn.getAttribute("data-delete-query");
      removeRecentSearch(q);
      updateDropdown();
      input.focus();
      return;
    }

    const clearAllBtn = event.target.closest(".search-clear-all-btn");
    if (clearAllBtn) {
      event.preventDefault();
      event.stopPropagation();
      clearRecentSearches();
      updateDropdown();
      input.focus();
      return;
    }

    const recentItem = event.target.closest(".search-recent-item");
    if (recentItem) {
      event.preventDefault();
      const q = recentItem.getAttribute("data-query");
      if (q) {
        input.value = q;
        addRecentSearch(q);
        updateDropdown();
        input.focus();
      }
      return;
    }

    const popularItem = event.target.closest(".search-popular-item");
    if (popularItem) {
      event.preventDefault();
      const q = popularItem.getAttribute("data-query");
      if (q) {
        input.value = q;
        addRecentSearch(q);
        updateDropdown();
        input.focus();
      }
      return;
    }

    const card = event.target.closest(".search-result-card");
    if (card) {
      if (input.value.trim()) {
        addRecentSearch(input.value.trim());
      }
      form.classList.remove("has-results");
      return;
    }

    const allLink = event.target.closest(".search-result-all");
    if (allLink) {
      if (input.value.trim()) {
        addRecentSearch(input.value.trim());
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) {
      form.classList.remove("has-results");
    }
  });
}



export function initScrollProgressBar() {
  let bar = document.querySelector("#scrollProgressBar");
  if (!bar) {
    const header = document.querySelector(".site-header");
    bar = document.createElement("div");
    bar.id = "scrollProgressBar";
    bar.className = "scroll-progress-bar";
    bar.setAttribute("aria-hidden", "true");
    if (header) {
      header.prepend(bar);
    } else {
      document.body.prepend(bar);
    }
  }

  const updateProgress = () => {
    const currentBar = document.querySelector("#scrollProgressBar");
    if (!currentBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const docHeight = scrollHeight - clientHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    currentBar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  requestAnimationFrame(updateProgress);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollProgressBar);
  } else {
    requestAnimationFrame(initScrollProgressBar);
  }
}
