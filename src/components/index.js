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

export function renderAccountActions() {
  const session = getSession();
  if (!session) return '<a class="login-link" href="/login.html">Đăng nhập</a>';

  const safeName = escapeHtml(session.name || "User");
  const initial = escapeHtml(session.name?.charAt(0).toUpperCase() || "U");
  const adminLink =
    session.role === "admin"
      ? '<a href="/admin/admin.html">Quản lý phim</a><a href="/admin/schedule.html">Quản lý lịch phát hành</a>'
      : "";
  const passwordLink =
    session.role === "user"
      ? '<a href="/account.html">Đổi mật khẩu</a>'
      : "";
  return `<details class="account-menu"><summary class="account-chip" aria-label="${safeName}" title="${safeName}"><span class="account-avatar">${initial}</span><span>${safeName}</span></summary><div class="account-dropdown">${adminLink}${passwordLink}<a href="/history.html">🕘 Lịch sử xem</a><a href="/favorites.html">♡ Phim yêu thích</a><button class="logout-button" id="logoutButton" type="button">↪ Đăng xuất</button></div></details>`;
}

export function bindAccountActions() {
  mountAssistantChat(getMovieDB());
  bindHeaderSearch();

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

function renderMovieCards(matches, query) {
  if (!matches.length) {
    return `<div class="search-empty">
      <p>Không tìm thấy phim phù hợp với "<strong>${escapeHtml(query)}</strong>".</p>
    </div>`;
  }

  const trimmed = query.trim();
  const allGenres = getGenreList();
  const isExactGenre = allGenres.some(
    (g) => normalizeSearchText(g) === normalizeSearchText(trimmed),
  );
  const footerUrl = isExactGenre
    ? `/genres.html?genre=${encodeURIComponent(trimmed)}`
    : `/search.html?q=${encodeURIComponent(trimmed)}`;
  const footerText = isExactGenre
    ? `Xem tất cả phim thể loại "${escapeHtml(trimmed)}" →`
    : `Xem tất cả kết quả cho "${escapeHtml(trimmed)}" →`;

  const cardsHtml = matches
    .slice(0, 6)
    .map((movie) => {
      const genres = getMovieGenres(movie);
      const primaryGenre = genres[0] || movie.genre || "Phim";
      const isAnimeOrAnimation =
        /hoạt hình|anime/i.test(primaryGenre) ||
        /hoạt hình|anime/i.test(movie.genre || "");
      const isSeries =
        /tập|season|phần|bộ|series/i.test(movie.title) || isAnimeOrAnimation;

      const badgeText = isSeries ? "Mùa mở đầu" : "Phim điện ảnh";
      const badgeClass = isSeries ? "badge-series" : "badge-movie";

      const subTitle =
        movie.originalTitle ||
        movie.englishTitle ||
        movie.subTitle ||
        movie.title;

      let extraLine = "";
      if (movie.episodes) {
        extraLine = `Tập ${escapeHtml(movie.episodes)}`;
      } else if (movie.status) {
        extraLine = escapeHtml(movie.status);
      } else if (isSeries) {
        extraLine = "Tập 2";
      } else if (movie.rating && Number(movie.rating) > 0) {
        extraLine = `★ ${Number(movie.rating).toFixed(1)}/10`;
      } else {
        extraLine = "Full";
      }

      const posterUrl = movie.poster || movie.backdrop || "";

      return `
        <a class="search-result search-result-card" href="/watch.html?id=${encodeURIComponent(movie.id)}" data-movie-id="${encodeURIComponent(movie.id)}">
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
              <span class="search-card-year">${escapeHtml(String(movie.year || "2024").slice(0, 4))}</span>
              <span class="search-card-genre">${escapeHtml(isAnimeOrAnimation ? "Hoạt Hình" : (primaryGenre || "Phim Lẻ"))}</span>
              ${!isSeries ? '<span class="search-card-tag">Full</span>' : ""}
            </div>
            <div class="search-card-extra">${extraLine}</div>
          </div>
        </a>
      `;
    })
    .join("");

  const footerLink = `
    <a class="search-result search-result-all" href="${footerUrl}">
      ${footerText}
    </a>
  `;

  return cardsHtml + footerLink;
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
    if (query) {
      addRecentSearch(query);
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
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

