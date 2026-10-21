import "./style.css";
import "./search-page.css";
import {
  getMovieDB,
  getMovieGenres,
  initializeCatalog,
} from "./data/data.js";
import {
  getMovieScoreOutOfTen,
  loadReviews,
  syncReviews,
} from "./data/reviews.js";
import {
  bindAccountActions,
  getPosterStyle,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

await initializeCatalog();

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

const movies = getMovieDB();
const reviews = loadReviews();
const availableGenres = [...new Set(movies.flatMap(getMovieGenres))].sort(
  (a, b) => a.localeCompare(b, "vi"),
);

const allYears = [
  ...new Set(
    movies
      .map((m) => String(m.year || "").slice(0, 4))
      .filter((y) => /^\d{4}$/.test(y)),
  ),
].sort((a, b) => Number(b) - Number(a));

const PAGE_SIZE = 24;
let currentPage = 1;

// Read initial query from URL
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

// ---- Render ----
const headerActions = `<form class="header-search" id="headerSearch" role="search">
  <label class="sr-only" for="searchInput">Tìm phim</label>
  <input id="searchInput" type="search" placeholder="Tìm phim..." autocomplete="off" aria-controls="searchResults">
  <button class="header-search-button" type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">⌕</button>
  <div class="search-results" id="searchResults" aria-live="polite"></div>
</form>
${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>`;

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "/",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "/new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    genresHref: "/genres.html",
    reviewsHref: "/reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "/favorites.html",
    favoritesActive: "",
    favoritesCurrent: "",
    rankingHref: "/ranking.html",
    rankingActive: "",
    rankingCurrent: "",
    headerActions,
  })}

  <main class="search-page-main" id="searchMain">
    <section class="search-intro">
      <div class="container">
        <p class="eyebrow">Tìm kiếm · MovieVerse</p>
        <h1>Tìm <em>phim</em> bạn muốn xem</h1>
        <p style="margin-top:12px;color:var(--muted);font-size:15px;max-width:480px;line-height:1.7">
          Tìm theo tên phim, lọc theo thể loại, năm phát hành hoặc điểm đánh giá.
        </p>
        <form class="search-bar-wrap" id="mainSearchForm" role="search" aria-label="Tìm kiếm phim">
          <label class="sr-only" for="mainSearchInput">Tên phim</label>
          <input
            id="mainSearchInput"
            type="search"
            placeholder="Nhập tên phim..."
            autocomplete="off"
            value="${escapeAttr(initialQuery)}"
            aria-label="Tên phim"
          />
          <button class="search-submit-btn" type="submit">
            <span aria-hidden="true">⌕</span> Tìm kiếm
          </button>
        </form>

        <div class="search-filters">
          <div class="search-filter-group">
            <label for="filterGenre">Thể loại</label>
            <select id="filterGenre" aria-label="Lọc theo thể loại">
              <option value="">Tất cả thể loại</option>
              ${availableGenres
                .map(
                  (g) => `<option value="${escapeAttr(g)}">${escapeHtml(g)}</option>`,
                )
                .join("")}
            </select>
          </div>

          <div class="search-filter-group">
            <label for="filterYear">Năm phát hành</label>
            <select id="filterYear" aria-label="Lọc theo năm phát hành">
              <option value="">Tất cả năm</option>
              ${allYears
                .map((y) => `<option value="${y}">${y}</option>`)
                .join("")}
            </select>
          </div>

          <div class="search-filter-group">
            <label for="filterRating">Điểm tối thiểu</label>
            <select id="filterRating" aria-label="Lọc theo điểm đánh giá">
              <option value="0">Tất cả điểm</option>
              <option value="7">≥ 7.0</option>
              <option value="8">≥ 8.0</option>
              <option value="9">≥ 9.0</option>
            </select>
          </div>

          <div class="search-filter-group search-sort-group">
            <label for="sortBy">Sắp xếp</label>
            <select id="sortBy" aria-label="Sắp xếp kết quả">
              <option value="relevance">Liên quan nhất</option>
              <option value="rating-desc">Điểm cao nhất</option>
              <option value="year-desc">Mới nhất</option>
              <option value="year-asc">Cũ nhất</option>
              <option value="title-asc">Tên A → Z</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="search-results-section container" aria-labelledby="searchResultsHeading" aria-live="polite">
      <div class="search-results-header">
        <h2 id="searchResultsHeading">Kết quả tìm kiếm</h2>
        <p class="search-count" id="searchCount"></p>
      </div>
      <div class="movie-grid" id="searchGrid"></div>
      <nav class="search-pagination" id="searchPagination" aria-label="Phân trang kết quả"></nav>
    </section>
  </main>

  ${renderFooter({
    footerClass: " new-page-footer",
    homeHref: "/",
    newMoviesHref: "/new-movies.html",
    rankingHref: "/ranking.html",
    genresHref: "/genres.html",
    aboutHref: "/info.html",
  })}
`;

bindAccountActions();

// ---- Hooks ----
const mainSearchInput = document.querySelector("#mainSearchInput");
const mainSearchForm = document.querySelector("#mainSearchForm");
const filterGenre = document.querySelector("#filterGenre");
const filterYear = document.querySelector("#filterYear");
const filterRating = document.querySelector("#filterRating");
const sortBy = document.querySelector("#sortBy");
const searchGrid = document.querySelector("#searchGrid");
const searchCount = document.querySelector("#searchCount");
const searchPagination = document.querySelector("#searchPagination");

// Set pre-selected genre from URL
const initialGenre = params.get("genre") || "";
if (initialGenre && availableGenres.includes(initialGenre)) {
  filterGenre.value = initialGenre;
}

// ---- Utils ----
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function highlightMatch(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(
    new RegExp(`(${escaped})`, "gi"),
    "<mark>$1</mark>",
  );
}

// ---- Filter & sort ----
function getFilteredMovies() {
  const query = mainSearchInput.value.trim().toLocaleLowerCase("vi");
  const genre = filterGenre.value;
  const year = filterYear.value;
  const minRating = Number(filterRating.value) || 0;
  const sort = sortBy.value;

  let filtered = movies.filter((movie) => {
    if (
      query &&
      !movie.title.toLocaleLowerCase("vi").includes(query) &&
      !String(movie.description || "")
        .toLocaleLowerCase("vi")
        .includes(query)
    ) {
      return false;
    }
    if (genre && !getMovieGenres(movie).includes(genre)) return false;
    if (year && String(movie.year || "").slice(0, 4) !== year) return false;
    if (minRating > 0) {
      const score = getMovieScoreOutOfTen(movie, reviews);
      if (score < minRating) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === "rating-desc") {
      return (
        getMovieScoreOutOfTen(b, reviews) - getMovieScoreOutOfTen(a, reviews)
      );
    }
    if (sort === "year-desc") {
      return Number(b.year) - Number(a.year);
    }
    if (sort === "year-asc") {
      return Number(a.year) - Number(b.year);
    }
    if (sort === "title-asc") {
      return a.title.localeCompare(b.title, "vi");
    }
    // relevance: title match first
    if (!query) return 0;
    const aTitle = a.title.toLocaleLowerCase("vi").includes(query);
    const bTitle = b.title.toLocaleLowerCase("vi").includes(query);
    if (aTitle && !bTitle) return -1;
    if (!aTitle && bTitle) return 1;
    return 0;
  });

  return filtered;
}

// ---- Render results ----
function renderResults() {
  const filtered = getFilteredMovies();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const query = mainSearchInput.value.trim();

  // Count text
  searchCount.innerHTML = query
    ? `Tìm thấy <strong>${total}</strong> kết quả cho "<strong>${escapeHtml(query)}</strong>"`
    : `Hiển thị <strong>${total}</strong> phim`;

  // Cards
  const pageMovies = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (pageMovies.length === 0) {
    searchGrid.innerHTML = `
      <div class="search-empty" style="grid-column:1/-1">
        <span class="search-empty-icon" aria-hidden="true">🔍</span>
        <div>
          <h3>Không tìm thấy phim phù hợp</h3>
          <p>Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để xem thêm kết quả.</p>
        </div>
        <a class="watch-button" href="/genres.html">Khám phá theo thể loại <span aria-hidden="true">→</span></a>
      </div>`;
  } else {
    searchGrid.innerHTML = pageMovies
      .map(
        (movie, index) => `
        <article class="movie-card" style="animation-delay:${index * 0.04}s">
          <a
            class="poster poster-link"
            href="/watch.html?id=${encodeURIComponent(movie.id)}"
            style="${getPosterStyle(movie)}"
            aria-label="Xem phim ${escapeAttr(movie.title)}"
          >
            <span class="play-circle" aria-hidden="true">▶</span>
          </a>
          <div class="movie-card-info">
            <h3>
              <a href="/movie-detail.html?id=${encodeURIComponent(movie.id)}">
                ${highlightMatch(movie.title, query)}
              </a>
            </h3>
            <span class="card-rating search-card-rating">★ ${getMovieScoreOutOfTen(movie, reviews).toFixed(1)}/10</span>
          </div>
          <p>${escapeHtml(movie.year || "—")} · ${escapeHtml(getMovieGenres(movie).join(", ") || "—")}</p>
        </article>`,
      )
      .join("");
  }

  // Pagination
  if (totalPages <= 1) {
    searchPagination.innerHTML = "";
  } else {
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";

    let pageButtons = "";
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        (p >= currentPage - 2 && p <= currentPage + 2)
      ) {
        pageButtons += `<button class="search-page-btn${p === currentPage ? " active" : ""}" data-page="${p}" aria-label="Trang ${p}" ${p === currentPage ? 'aria-current="page"' : ""}>${p}</button>`;
      } else if (p === currentPage - 3 || p === currentPage + 3) {
        pageButtons += `<span style="color:var(--muted);padding:0 4px">…</span>`;
      }
    }

    searchPagination.innerHTML = `
      <button class="search-page-btn" data-page="${currentPage - 1}" aria-label="Trang trước" ${prevDisabled}>‹</button>
      ${pageButtons}
      <button class="search-page-btn" data-page="${currentPage + 1}" aria-label="Trang sau" ${nextDisabled}>›</button>`;
  }
}

// ---- Events ----
mainSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentPage = 1;
  updateUrl();
  renderResults();
});

[filterGenre, filterYear, filterRating, sortBy].forEach((el) => {
  el.addEventListener("change", () => {
    currentPage = 1;
    renderResults();
  });
});

mainSearchInput.addEventListener("input", () => {
  currentPage = 1;
  renderResults();
});

searchPagination.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn || btn.disabled) return;
  currentPage = Number(btn.dataset.page);
  renderResults();
  document
    .querySelector("#searchMain")
    .scrollIntoView({ behavior: "smooth", block: "start" });
});

// Header search redirect
document.querySelector("#headerSearch")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.querySelector("#searchInput").value.trim();
  if (q) window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
});

// Header inline results
document.querySelector("#searchInput")?.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLocaleLowerCase("vi");
  const container = document.querySelector("#searchResults");
  if (!container) return;
  if (!q) {
    container.innerHTML = "";
    container.removeAttribute("data-open");
    return;
  }
  const hits = movies
    .filter((m) => m.title.toLocaleLowerCase("vi").includes(q))
    .slice(0, 6);
  container.setAttribute("data-open", "");
  container.innerHTML = hits.length
    ? hits
        .map(
          (m) =>
            `<a class="search-result-item" href="/watch.html?id=${encodeURIComponent(m.id)}">${escapeHtml(m.title)} <span>${escapeHtml(m.year || "")}</span></a>`,
        )
        .join("") +
      `<a class="search-result-item search-result-all" href="/search.html?q=${encodeURIComponent(e.target.value.trim())}">Xem tất cả kết quả →</a>`
    : `<p class="search-result-empty">Không tìm thấy phim phù hợp.</p>`;
});

function updateUrl() {
  const q = mainSearchInput.value.trim();
  const url = new URL(window.location.href);
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  window.history.replaceState({}, "", url.toString());
}

document.querySelector(".menu-toggle")?.addEventListener("click", (event) => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

// Initial render
renderResults();

// Focus search input if query present
if (initialQuery) {
  mainSearchInput.focus();
}
