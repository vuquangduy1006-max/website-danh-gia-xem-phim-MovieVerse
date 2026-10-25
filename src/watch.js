import "./style.css";
import "./movie-detail.css";
import "./watch.css";
import { getMovieDB, initializeCatalog } from "./data/data.js";
import {
  getEpisodeSource,
  getWatchSources,
  getMovieCredits,
  getSimilarMovies,
} from "./data/media.js";
import {
  getMovieScoreOutOfTen,
  loadReviews,
  syncReviews,
  getMovieReviews,
  addReview,
  deleteReview,
  addReviewReply,
  getReviewReplies,
} from "./data/reviews.js";
import { getSession, isAdmin } from "./data/auth.js";
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
} from "./data/favorites.js";
import { addToWatchHistory } from "./data/history.js";
import { bindHeaderSearch, renderHeaderSearch } from "./components/index.js";

const WATCHLIST_KEY = "movieverse_watchlist";
const PROGRESS_KEY = "movieverse_watch_progress";

await initializeCatalog();

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

const movieList = getMovieDB();
const allReviews = loadReviews();
const params = new URLSearchParams(window.location.search);
const movie = resolveMovie();

if (movie) {
  renderWatchPage(movie);
} else {
  renderNotFound();
}
bindHeaderSearch();

function resolveMovie() {
  const id = params.get("id");
  const title = params.get("title");
  return (
    movieList.find((item) => item.id === id) ||
    movieList.find((item) => item.title === title) ||
    null
  );
}

function renderNotFound() {
  document.querySelector("#app").innerHTML = `
    <header class="site-header new-page-header">
      <div class="container nav-wrap">
        <a class="brand" href="/"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="main-nav" aria-label="Điều hướng chính">
          <a href="/">Trang chủ</a><a href="/new-movies.html">Phim mới</a><a href="/schedule.html">Lịch phát hành</a><a href="/genres.html">Thể loại</a><a href="/ranking.html">Top phim</a>
        </nav>
        <div class="nav-actions">${renderHeaderSearch()}<a class="login-link" href="/">Về trang chủ →</a></div>
      </div>
    </header>
    <main class="detail-notfound">
      <div class="container">
        <p class="eyebrow">Lỗi 404</p>
        <h1>Không tìm thấy phim này</h1>
        <p>Bộ phim bạn tìm không còn tồn tại hoặc đã bị gỡ khỏi kho.</p>
        <a class="watch-button" href="/">← Quay về trang chủ</a>
      </div>
    </main>
  `;
}

function renderWatchPage(current) {
  addToWatchHistory(current.id, {
    title: current.title,
    poster: current.poster,
    year: current.year,
    genre: current.genre,
  });

  const sources = getWatchSources(current);
  const credits = getMovieCredits(current);
  const similar = getSimilarMovies(current, movieList);
  const episodeUrls = Array.isArray(current.episodes) ? current.episodes : [];
  const playableEpisodeUrls = current.movieUrl
    ? [current.movieUrl, ...episodeUrls]
    : episodeUrls;
  const rawEpisodeCount = Number(current.episodeCount ?? 0);
  const isKamenRiderBuild =
    current.id === "n19" ||
    current.title.trim().toLocaleLowerCase("vi") === "kamen rider build";
  const episodeCount =
    playableEpisodeUrls.length > 0
      ? playableEpisodeUrls.length
      : Number.isFinite(rawEpisodeCount) && rawEpisodeCount > 1
        ? rawEpisodeCount
        : isKamenRiderBuild
          ? 49
          : 1;
  const availableEpisodes = new Set(
    Array.from({ length: episodeCount }, (_, index) => index + 1).filter(
      (episode) => getEpisodeSource(current, episode),
    ),
  );
  const requestedEpisode = Number(params.get("episode"));
  const requestedEpisodeNumber = Number.isInteger(requestedEpisode)
    ? Math.min(Math.max(requestedEpisode, 1), episodeCount)
    : 1;
  let activeEpisode = availableEpisodes.has(requestedEpisodeNumber)
    ? requestedEpisodeNumber
    : (availableEpisodes.values().next().value ?? 1);
  if (
    params.has("episode") &&
    !availableEpisodes.has(requestedEpisodeNumber)
  ) {
    if (availableEpisodes.has(activeEpisode)) {
      params.set("episode", String(activeEpisode));
    } else {
      params.delete("episode");
    }
    const normalizedUrl = new URL(window.location.href);
    normalizedUrl.searchParams.delete("episode");
    const validEpisode = params.get("episode");
    if (validEpisode) normalizedUrl.searchParams.set("episode", validEpisode);
    window.history.replaceState({}, "", normalizedUrl);
  }
  const catalog = getMovieDB().slice(0, 12);
  const position = catalog.findIndex((item) => item.id === current.id);
  const start = position >= 0 ? position : 0;
  const playlist = [...catalog.slice(start), ...catalog.slice(0, start)].slice(
    0,
    8,
  );
  const pageUrl = `${window.location.origin}/watch.html?id=${encodeURIComponent(current.id)}`;
  const shareText = `Đang xem ${current.title} (${current.year}) trên MovieVerse`;
  const score = getMovieScoreOutOfTen(current, allReviews);

  document.querySelector("#app").innerHTML = `
    <header class="site-header watch-header">
      <div class="container nav-wrap">
        <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="main-nav" aria-label="Điều hướng chính">
          <a href="/">Trang chủ</a><a href="/new-movies.html">Phim mới</a><a href="/schedule.html">Lịch phát hành</a><a href="/genres.html">Thể loại</a><a href="/ranking.html">Top phim</a>
        </nav>
        <div class="nav-actions">
          ${renderHeaderSearch()}
          <a class="login-link" href="/movie-detail.html?id=${encodeURIComponent(current.id)}">Chi tiết phim <span aria-hidden="true">→</span></a>
          <button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>
        </div>
      </div>
    </header>

    <main class="watch-main">
      <div class="container">
        <nav class="detail-breadcrumb" aria-label="Đường dẫn">
          <a href="/">Trang chủ</a><span aria-hidden="true">/</span>
          <a href="/movie-detail.html?id=${encodeURIComponent(current.id)}">${current.title}</a><span aria-hidden="true">/</span>
          <strong>Xem phim</strong>
        </nav>

        <div class="watch-layout">
          <div class="watch-primary">
            <div class="player-shell" id="playerShell">
              <div class="player-stage" id="playerStage"></div>

              <div class="player-empty" id="playerEmpty" hidden>
                <span class="player-empty-mark" aria-hidden="true">▶</span>
                <p class="player-empty-title">Chưa có nguồn phát cho phim này</p>
                <p class="player-empty-desc">
                  <strong>${current.title}</strong> chưa có trailer hay nội dung chính thức
                  được thêm vào kho. Hãy xem chi tiết phim hoặc chọn một bộ khác trong danh sách phát.
                </p>
                <a class="tb-btn" href="/movie-detail.html?id=${encodeURIComponent(current.id)}">ⓘ <span>Xem trang chi tiết</span></a>
              </div>

              <div class="player-spinner" id="playerSpinner" hidden><span></span></div>

              <div class="player-error" id="playerError" hidden>
                <p>Không tải được nguồn phim này.</p>
                <button type="button" class="player-retry" id="playerRetry">Thử lại</button>
              </div>

              <div class="player-controls" id="playerControls" hidden>
                <div class="player-seek">
                  <span class="player-buffered" id="playerBuffered"></span>
                  <input type="range" id="playerSeek" min="0" max="1000" value="0" step="1" aria-label="Tua video">
                </div>

                <div class="player-bar">
                  <button type="button" class="pc-btn" id="playToggle" aria-label="Phát">
                    <span class="pc-icon" id="playIcon" aria-hidden="true">▶</span>
                  </button>
                  <button type="button" class="pc-btn" id="backBtn" aria-label="Lùi 10 giây" title="Lùi 10 giây">↺<small>10</small></button>
                  <button type="button" class="pc-btn" id="forwardBtn" aria-label="Tiến 10 giây" title="Tiến 10 giây">↻<small>10</small></button>

                  <div class="player-volume">
                    <button type="button" class="pc-btn" id="muteBtn" aria-label="Tắt tiếng">
                      <span class="pc-icon" id="volumeIcon" aria-hidden="true">🔊</span>
                    </button>
                    <input type="range" id="volumeRange" min="0" max="100" value="100" aria-label="Âm lượng">
                  </div>

                  <span class="player-time"><span id="currentTime">0:00</span> / <span id="totalTime">0:00</span></span>

                  <div class="player-spacer"></div>

                  <label class="player-speed">
                    <span class="sr-only">Tốc độ phát</span>
                    <select id="speedSelect">
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1" selected>1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </label>
                  <button type="button" class="pc-btn" id="pipBtn" aria-label="Hình trong hình">▣</button>
                  <button type="button" class="pc-btn" id="fullscreenBtn" aria-label="Toàn màn hình">⛶</button>
                </div>
              </div>
            </div>

            <div class="player-resume" id="resumeBar" hidden>
              <p>Bạn đã dừng ở <strong id="resumeTime">0:00</strong>.</p>
              <button type="button" class="tb-btn" id="resumeBtn">Tiếp tục xem</button>
              <button type="button" class="tb-btn" id="restartBtn">Xem lại từ đầu</button>
            </div>

            <div class="player-status">
              <div class="player-servers" role="group" aria-label="Chọn nguồn phát">
                <span class="player-status-label" id="serverLabel">Nguồn phát</span>
                <div class="server-list" id="serverList"></div>
              </div>
              <a class="player-open-link" id="playerOpenLink" href="#" target="_blank" rel="noopener noreferrer">
                Mở trên YouTube <span aria-hidden="true">↗</span>
              </a>
              <p class="player-hint" id="playerHint" hidden>
                Phím tắt: <kbd>Space</kbd> phát/dừng · <kbd>←</kbd><kbd>→</kbd> tua 5s ·
                <kbd>↑</kbd><kbd>↓</kbd> âm lượng · <kbd>M</kbd> tắt tiếng · <kbd>F</kbd> toàn màn hình
              </p>
            </div>

            <section class="detail-block watch-info" aria-labelledby="watchInfoHeading">
              <div class="watch-info-head">
                <div class="detail-poster watch-poster" style="background-image:url('${current.poster}')" role="img" aria-label="Áp phích phim ${current.title}"></div>
                <div class="watch-info-copy">
                  <p class="eyebrow">${current.genre} · ${current.year}</p>
                  <h1 id="watchInfoHeading">${current.title}</h1>
                  <div class="detail-metrics">
                    <span class="detail-score">★ ${score.toFixed(1)}/10</span>
                    <span>IMDb ${current.rating}/10</span>
                    <span>${escapeHtml(credits.runtime)}</span>
                    <span>${escapeHtml(credits.ageRating)}</span>
                    <span>${escapeHtml(credits.language)}</span>
                  </div>
                  <p class="detail-summary">${current.description}</p>
                  <div class="detail-toolbar" role="toolbar" aria-label="Công cụ phim ${current.title}">
                    <button type="button" class="tb-btn" data-tool="favorite" aria-pressed="false">♡ <span>Yêu thích</span></button>
                    <a class="tb-btn" href="#watchComments">💬 <span>Bình luận</span></a>
                    <div class="tb-share">
                      <button type="button" class="tb-btn" data-tool="share" aria-expanded="false" aria-controls="watchSharePanel">↗ <span>Chia sẻ</span></button>
                      <div class="tb-share-menu" id="watchSharePanel" hidden>
                        <p class="tb-share-title">Chia sẻ phim này</p>
                        <div class="share-grid">
                          <button type="button" class="share-btn share-facebook" data-share="facebook"><span aria-hidden="true">f</span>Facebook</button>
                          <button type="button" class="share-btn share-tiktok" data-share="tiktok"><span aria-hidden="true">♪</span>TikTok</button>
                          <button type="button" class="share-btn share-instagram" data-share="instagram"><span aria-hidden="true">◎</span>Instagram</button>
                          <button type="button" class="share-btn share-copy" data-share="copy"><span aria-hidden="true">⎘</span>Sao chép link</button>
                        </div>
                      </div>
                    </div>
                    <a class="tb-btn" href="/movie-detail.html?id=${encodeURIComponent(current.id)}">ⓘ <span>Chi tiết & đánh giá</span></a>
                  </div>
                </div>
              </div>

              <dl class="info-list watch-credits">
                <div><dt>Đạo diễn</dt><dd>${escapeHtml(credits.director)}</dd></div>
                <div><dt>Diễn viên</dt><dd>${credits.cast.length ? escapeHtml(credits.cast.join(", ")) : "Chưa cập nhật"}</dd></div>
                ${credits.writers.length ? `<div><dt>Biên kịch / tác giả</dt><dd>${escapeHtml(credits.writers.join(", "))}</dd></div>` : ""}
                ${credits.producers.length ? `<div><dt>Nhà sản xuất</dt><dd>${escapeHtml(credits.producers.join(", "))}</dd></div>` : ""}
                ${credits.cinematographers.length ? `<div><dt>Quay phim</dt><dd>${escapeHtml(credits.cinematographers.join(", "))}</dd></div>` : ""}
                ${credits.composers.length ? `<div><dt>Âm nhạc</dt><dd>${escapeHtml(credits.composers.join(", "))}</dd></div>` : ""}
                <div><dt>Ngày phát hành</dt><dd>${escapeHtml(credits.releaseDate)}</dd></div>
                <div><dt>Quốc gia</dt><dd>${escapeHtml(credits.country)}</dd></div>
                <div><dt>Hãng phim</dt><dd>${escapeHtml(credits.studio)}</dd></div>
                <div><dt>Giải thưởng</dt><dd>${escapeHtml(credits.awards)}</dd></div>
                <div><dt>Doanh thu</dt><dd>${escapeHtml(credits.boxOffice)}</dd></div>
                <div><dt>Website chính thức</dt><dd>${credits.website ? `<a href="${escapeHtml(credits.website)}" target="_blank" rel="noopener noreferrer">Truy cập website</a>` : "Chưa cập nhật"}</dd></div>
                <div><dt>Nguồn phát</dt><dd>${sources.length ? `${sources.length} nguồn phát` : "Chưa cập nhật"}</dd></div>
              </dl>
              <p class="metadata-attribution">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
            </section>

            <section class="detail-block watch-comments-section" id="watchComments" aria-labelledby="watchCommentsHeading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">Góc nhìn cộng đồng</p>
                  <h2 id="watchCommentsHeading">Bình luận phim</h2>
                </div>
                <span class="detail-review-badge" id="watchCommentBadge"></span>
              </div>
              <div id="watchCommentSummary"></div>
              <form class="detail-review-form" id="watchCommentForm" novalidate>
                <div class="review-form-heading">
                  <div>
                    <span class="review-form-kicker">Đang xem phim?</span>
                    <h3>Chia sẻ cảm nhận của bạn</h3>
                  </div>
                  <span class="review-form-note">Mất chưa đến 1 phút</span>
                </div>
                <div class="review-form-rating">
                  <span class="review-field-label">Bạn chấm phim này thế nào?</span>
                  <div class="star-input" id="watchStarInput" aria-label="Chọn số sao"></div>
                </div>
                <div id="watchAuthorRow"></div>
                <label class="sr-only" for="watchCommentText">Cảm nhận của bạn</label>
                <textarea id="watchCommentText" rows="3" placeholder="Điều gì khiến bạn nhớ nhất về bộ phim này?"></textarea>
                <div class="detail-review-foot">
                  <p id="watchCommentHint" aria-live="polite"></p>
                  <button type="submit" class="tb-btn tb-btn-primary">Gửi bình luận <span aria-hidden="true">→</span></button>
                </div>
              </form>
              <div class="detail-review-list" id="watchCommentList"></div>
            </section>
          </div>

          <aside class="watch-aside">
            <section class="aside-card" aria-labelledby="episodesHeading">
              <div class="watch-aside-heading">
                <div><p class="eyebrow">${episodeCount > 1 ? "Series" : "Phim lẻ"}</p><h3 id="episodesHeading">Tập phim</h3></div>
                <span class="watch-aside-count" id="episodeCount" aria-label="${episodeCount} tập">${String(episodeCount).padStart(2, "0")}</span>
              </div>
              <p class="aside-desc episode-note">${availableEpisodes.size === episodeCount ? "Video từng tập được phát từ liên kết đã cập nhật." : availableEpisodes.size ? `Đã có liên kết video cho ${availableEpisodes.size}/${episodeCount} tập.` : episodeCount > 1 ? `Đã ghi nhận ${episodeCount} tập nhưng chưa có liên kết video tập.` : "Chưa có liên kết video nội dung phim."}${sources.length ? " Nguồn phát phía trên chỉ có trailer hoặc clip, không phải nội dung đầy đủ." : " Chưa có trailer hoặc nguồn video nào trong kho."}</p>
              <div class="episode-list" id="episodeList" role="group" aria-label="Danh sách tập phim"></div>
            </section>

            <section class="aside-card" aria-labelledby="playlistHeading">
              <div class="watch-aside-heading">
                <div><p class="eyebrow">Xem tiếp</p><h3 id="playlistHeading">Danh sách phát</h3></div>
                <span class="watch-aside-count" aria-label="${playlist.length} phim">${String(playlist.length).padStart(2, "0")}</span>
              </div>
              <p class="aside-desc">Các phim trong phiên xem này.</p>
              <div class="similar-list watch-playlist" id="playlistList"></div>
            </section>

            <section class="aside-card" aria-labelledby="watchSimilarHeading">
              <div class="watch-aside-heading">
                <div><p class="eyebrow">Có thể bạn sẽ thích</p><h3 id="watchSimilarHeading">Gợi ý cho bạn</h3></div>
                <span class="watch-aside-count" aria-label="${similar.length} gợi ý">${String(similar.length).padStart(2, "0")}</span>
              </div>
              <div class="similar-list" id="watchSimilarList"></div>
            </section>
          </aside>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-bottom">
        <span>© 2024 MovieVerse. Made for movie lovers.</span>
        <a href="/">← Quay về MovieVerse</a>
      </div>
    </footer>

    <div class="detail-toast" id="watchToast" role="status" aria-live="polite"></div>

    <div class="modal" id="nextEpisodeOverlay" aria-hidden="true">
      <div class="next-episode-card" role="dialog" aria-modal="true" aria-labelledby="nextEpisodeTitle">
        <button type="button" class="modal-close" data-close-next-episode aria-label="Đóng">×</button>
        <div class="next-episode-icon">⏭</div>
        <p class="eyebrow">Chuyển tập</p>
        <h3 id="nextEpisodeTitle">Tiếp tục xem tập tiếp theo?</h3>
        <p id="nextEpisodeText">Bạn đang ở tập <strong id="nextEpisodeCurrent">1</strong>. Chuyển sang tập <strong id="nextEpisodeTarget">2</strong> ngay bây giờ?</p>
        <div class="next-episode-actions">
          <button type="button" class="tb-btn tb-btn-ghost" data-close-next-episode>Ở lại</button>
          <button type="button" class="tb-btn" data-confirm-next-episode>Chuyển tập</button>
        </div>
      </div>
    </div>
  `;

  const playerShell = document.querySelector("#playerShell");
  const nextEpisodeOverlay = document.querySelector("#nextEpisodeOverlay");
  nextEpisodeOverlay.classList.add("next-episode-overlay");
  playerShell.append(nextEpisodeOverlay);

  const stage = document.querySelector("#playerStage");
  const emptyBox = document.querySelector("#playerEmpty");
  const seek = document.querySelector("#playerSeek");
  const bufferedBar = document.querySelector("#playerBuffered");
  const volumeRange = document.querySelector("#volumeRange");
  const playIcon = document.querySelector("#playIcon");
  const controls = document.querySelector("#playerControls");
  const spinner = document.querySelector("#playerSpinner");
  const errorBox = document.querySelector("#playerError");
  const openLink = document.querySelector("#playerOpenLink");
  const sharePanel = document.querySelector("#watchSharePanel");

  let video = null;
  let ytPlayer = null;
  let activeSource = 0;
  let isEpisodeSourcePlaying = false;
  let resumeAt = 0;
  let autoplayMuted = false;
  const errorTried = new Set();
  let ytReady = false;
  const ytPending = [];

  // Lớp trung gian để nút điều khiển không cần biết đang phát YouTube hay MP4.
  const backend = {
    get active() {
      return video ? "file" : ytPlayer ? "youtube" : null;
    },
    get time() {
      if (video) return video.currentTime;
      if (ytPlayer?.seekTarget !== null && ytPlayer?.seekTarget !== undefined) {
        return ytPlayer.seekTarget;
      }
      if (ytPlayer?.api) return ytPlayer.api.getCurrentTime() || 0;
      return ytPlayer?.currentTime || 0;
    },
    get duration() {
      if (video) return video.duration;
      if (ytPlayer?.api) return ytPlayer.api.getDuration() || 0;
      return ytPlayer?.duration || 0;
    },
    get playing() {
      if (video) return !video.paused && !video.ended;
      const states = window.YT?.PlayerState;
      if (ytPlayer?.api && states) return ytPlayer.state === states.PLAYING;
      return false;
    },
    get volume() {
      if (video) return video.muted ? 0 : video.volume;
      return ytPlayer ? (ytPlayer.muted ? 0 : ytPlayer.volume) : 1;
    },
    get speed() {
      if (video) return video.playbackRate;
      return ytPlayer?.playbackRate || 1;
    },
    play() {
      if (video) {
        if (autoplayMuted) {
          video.muted = false;
          autoplayMuted = false;
          setVolumeIcon();
          savePrefs();
        }
        return video.play().catch(() => {});
      }
      ytPlayer?.api?.playVideo();
    },
    pause() {
      if (video) return void video.pause();
      ytPlayer?.api?.pauseVideo();
    },
    toggle() {
      if (this.playing) this.pause();
      else this.play();
    },
    seekTo(seconds) {
      const total = this.duration;
      if (!Number.isFinite(total) || total <= 0) return;
      const target = Math.min(Math.max(seconds, 0), total);
      if (video) video.currentTime = target;
      else if (ytPlayer?.api) {
        ytPlayer.seekTarget = target;
        ytPlayer.seekTargetExpiresAt = Date.now() + 2000;
        ytPlayer.api.seekTo(target, true);
      }
    },
    setVolume(value) {
      if (video) {
        video.volume = value;
        video.muted = value === 0;
        return;
      }
      if (!ytPlayer?.api) return;
      ytPlayer.volume = value;
      ytPlayer.muted = value === 0;
      ytPlayer.api.setVolume(Math.round(value * 100));
      if (value === 0) ytPlayer.api.mute();
      else ytPlayer.api.unMute();
    },
    toggleMute() {
      const next = this.volume > 0 ? 0 : 0.6;
      this.setVolume(next);
      volumeRange.value = String(Math.round(next * 100));
      setVolumeIcon();
      savePrefs();
    },
    setSpeed(value) {
      if (video) video.playbackRate = value;
      else if (ytPlayer?.api) {
        ytPlayer.playbackRate = value;
        ytPlayer.api.setPlaybackRate(value);
      }
    },
  };

  stage.addEventListener("click", (event) => {
    if (!video || event.target !== video) return;
    event.preventDefault();
    backend.toggle();
  });

  function setPlayIcon(isPlaying) {
    playIcon.textContent = isPlaying ? "❚❚" : "▶";
    document
      .querySelector("#playToggle")
      .setAttribute("aria-label", isPlaying ? "Tạm dừng" : "Phát");
  }

  function setVolumeIcon() {
    const icon = document.querySelector("#volumeIcon");
    const level = backend.volume;
    icon.textContent = level === 0 ? "🔇" : "🔊";
    document
      .querySelector("#muteBtn")
      .setAttribute("aria-label", level === 0 ? "Bật tiếng" : "Tắt tiếng");
  }

  function applyPrefsToPlayer(player) {
    const prefs = loadPrefs();
    const volume = typeof prefs.volume === "number" ? prefs.volume : 1;
    const speed = typeof prefs.speed === "number" ? prefs.speed : 1;
    player.volume = Math.min(Math.max(volume, 0), 1);
    player.muted = player.volume === 0;
    player.playbackRate = speed;
  }

  renderServers();
  renderEpisodes();
  renderPlaylist();
  renderSimilar();
  renderWatchStarInput();
  renderWatchComments();
  loadPlayerPrefs();
  bindServers();
  bindEpisodes();
  bindSharedControls();
  bindToolbar();
  bindShareButtons(pageUrl, shareText);
  bindMenuToggle();
  bindKeyboard();
  bindWatchComments();

  // load last, so every listener is already attached
  loadSource(activeSource, getEpisodeSource(current, activeEpisode));

  function renderServers() {
    const list = document.querySelector("#serverList");
    const label = document.querySelector("#serverLabel");

    if (!sources.length) {
      label.textContent = "Nguồn phát";
      list.innerHTML =
        '<p class="empty-note">Phim này chưa có nguồn phát nào.</p>';
      return;
    }

    label.textContent = "Nguồn phát";
    list.innerHTML = sources
      .map(
        (source, index) => `
        <button type="button" class="server-btn" data-server="${index}" aria-pressed="${index === activeSource}">
          <strong>${source.label}</strong><span>${source.variant} · ${source.note}</span>
        </button>`,
      )
      .join("");
  }

  function renderEpisodes() {
    const list = document.querySelector("#episodeList");
    if (!availableEpisodes.size) {
      list.innerHTML =
        '<p class="episode-unavailable">Chưa có video tập nào để phát.</p>';
      return;
    }
    list.innerHTML = Array.from({ length: episodeCount }, (_, index) => {
      const episode = index + 1;
      const label = episodeCount === 1 ? "Phim lẻ" : `Tập ${String(episode).padStart(2, "0")}`;
      const hasSource = availableEpisodes.has(episode);
      return `<button type="button" class="episode-btn ${episode === activeEpisode ? "is-current" : ""}" data-episode="${episode}" aria-pressed="${episode === activeEpisode}"${hasSource ? "" : " disabled"}>${label}</button>`;
    }).join("");
  }

  function goToEpisode(nextEpisode, options = {}) {
    const target = Number.isFinite(nextEpisode)
      ? Math.min(Math.max(Number(nextEpisode), 1), episodeCount)
      : activeEpisode;

    if (target === activeEpisode && !options.force) return;
    const episodeSource = getEpisodeSource(current, target);
    if (!episodeSource) {
      showToast(`Video tập ${target} chưa được cập nhật.`);
      return;
    }
    activeEpisode = target;
    document.querySelectorAll(".episode-btn").forEach((episodeButton) => {
      const isActive = Number(episodeButton.dataset.episode) === activeEpisode;
      episodeButton.classList.toggle("is-current", isActive);
      episodeButton.setAttribute("aria-pressed", String(isActive));
    });
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("episode", String(activeEpisode));
    window.history.replaceState({}, "", nextUrl);
    loadSource(activeSource, episodeSource);

    if (episodeCount > 1) {
      showToast(
        options.autoNext
          ? `Đã tự chuyển sang tập ${activeEpisode}.`
          : episodeSource
            ? `Đang phát tập ${activeEpisode}.`
            : `Đã chọn tập ${activeEpisode}. Video tập chưa được cập nhật.`,
      );
    }
  }

  function bindEpisodes() {
    document.querySelector("#episodeList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-episode]");
      if (!button) return;
      goToEpisode(Number(button.dataset.episode));
    });
  }

  function confirmNextEpisode() {
    if (episodeCount <= 1 || activeEpisode >= episodeCount) return Promise.resolve(false);

    const overlay = document.querySelector("#nextEpisodeOverlay");
    const current = document.querySelector("#nextEpisodeCurrent");
    const target = document.querySelector("#nextEpisodeTarget");
    const confirmButton = document.querySelector("[data-confirm-next-episode]");
    const cancelButtons = document.querySelectorAll("[data-close-next-episode]");

    current.textContent = String(activeEpisode);
    target.textContent = String(activeEpisode + 1);

    return new Promise((resolve) => {
      const close = () => {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        confirmButton.onclick = null;
        cancelButtons.forEach((button) => {
          button.onclick = null;
        });
      };

      confirmButton.onclick = () => {
        close();
        resolve(true);
      };

      cancelButtons.forEach((button) => {
        button.onclick = () => {
          close();
          resolve(false);
        };
      });

      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    });
  }

  let watchSelectedRating = 0;

  function renderWatchStarInput() {
    const input = document.querySelector("#watchStarInput");
    if (!input) return;
    input.innerHTML = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button type="button" class="star" data-star="${n}" aria-label="Chọn ${n} sao">★</button>`,
      )
      .join("");

    const stars = input.querySelectorAll(".star");
    const hint = document.querySelector("#watchCommentHint");

    const paint = (count) => {
      stars.forEach((star) =>
        star.classList.toggle("filled", Number(star.dataset.star) <= count),
      );
    };

    stars.forEach((star) =>
      star.addEventListener("mouseenter", () => {
        if (!watchSelectedRating) paint(Number(star.dataset.star));
      }),
    );
    stars.forEach((star) =>
      star.addEventListener("click", () => {
        watchSelectedRating = Number(star.dataset.star);
        paint(watchSelectedRating);
        if (hint) {
          hint.textContent = `Bạn đã chấm ${watchSelectedRating}/5 sao`;
          hint.style.color = "var(--accent)";
        }
      }),
    );
    input.addEventListener("mouseleave", () => paint(watchSelectedRating));
  }

  function renderWatchComments() {
    const list = getMovieReviews(current.title);
    const badge = document.querySelector("#watchCommentBadge");
    const summary = document.querySelector("#watchCommentSummary");
    if (!badge || !summary) return;

    if (!list.length) {
      badge.textContent = "Chưa có bình luận";
      summary.innerHTML = "";
    } else {
      const average =
        list.reduce((sum, review) => sum + Number(review.rating), 0) /
        list.length;
      const distribution = [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: list.filter((review) => Number(review.rating) === star).length,
      }));

      badge.textContent = `★ ${average.toFixed(1)}/5 · ${list.length} bình luận`;
      summary.innerHTML = `
        <div class="review-overview">
          <div class="review-overview-score">
            <strong>${average.toFixed(1)}</strong>
            <div class="review-stars">${"★".repeat(Math.round(average))}${"☆".repeat(5 - Math.round(average))}</div>
            <small>${list.length} đánh giá từ cộng đồng</small>
          </div>
          <div class="review-bars">
            ${distribution
              .map(
                (row) => `
              <div class="review-bar">
                <span>${row.star} ★</span>
                <span class="review-bar-track"><span style="width:${(row.count / list.length) * 100}%"></span></span>
                <span class="review-bar-count">${row.count}</span>
              </div>`,
              )
              .join("")}
          </div>
        </div>`;
    }

    const sorted = [...list].sort((a, b) => {
      const dateA = new Date(String(a.date).split("/").reverse().join("-"));
      const dateB = new Date(String(b.date).split("/").reverse().join("-"));
      return dateB - dateA;
    });

    const commentList = document.querySelector("#watchCommentList");
    if (!commentList) return;
    commentList.innerHTML = sorted.length
      ? sorted
          .map(
            (review) => {
              const replies = getReviewReplies(review);
              const session = getSession();
              return `
        <article class="review-item">
          <div class="review-avatar">${escapeHtml(review.author.charAt(0))}</div>
          <div class="review-body">
            <div class="review-top"><strong>${escapeHtml(review.author)}</strong><span class="review-date">${escapeHtml(review.date)}</span></div>
            <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p>${escapeHtml(review.comment)}</p>
            ${replies.length ? `<div class="detail-reply-thread" aria-label="Các câu trả lời">${replies.map((reply) => `<div class="detail-admin-reply${reply.role === "admin" ? " is-admin" : ""}"><div class="detail-reply-heading"><strong>${escapeHtml(reply.author)}</strong>${reply.role === "admin" ? '<span class="reply-admin-badge">ADMIN</span>' : ""}<small>${escapeHtml(reply.date)}</small></div><p>${escapeHtml(reply.comment)}</p></div>`).join("")}</div>` : ""}
            ${session
              ? `<form class="detail-reply-form" data-watch-reply="${escapeHtml(review.id)}">
                  <div class="detail-reply-identity">
                    <span class="detail-reply-avatar">${escapeHtml(session.name.charAt(0))}</span>
                    <span>Trả lời với tư cách <strong>${escapeHtml(session.name)}</strong></span>
                    ${session.role === "admin" ? '<span class="reply-admin-badge">ADMIN</span>' : ""}
                  </div>
                  <label class="sr-only" for="watch-reply-${escapeHtml(review.id)}">Nội dung trả lời</label>
                  <textarea id="watch-reply-${escapeHtml(review.id)}" name="comment" maxlength="280" rows="2" placeholder="Viết câu trả lời..." required></textarea>
                  <div class="detail-reply-submit-row">
                    <span class="detail-reply-hint" aria-live="polite"></span>
                    <button type="submit" class="detail-reply-submit">Gửi trả lời <span aria-hidden="true">→</span></button>
                  </div>
                </form>`
              : `<div class="detail-reply-login">
                  <span>Đăng nhập để tham gia thảo luận</span>
                  <a href="/login.html?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}">Đăng nhập <span aria-hidden="true">→</span></a>
                </div>`}
            <div class="detail-review-actions"><span></span>${isAdmin() ? `<button type="button" class="delete-review" data-watch-delete-review="${escapeHtml(review.id)}">Xóa bình luận</button>` : ""}</div>
          </div>
        </article>`;
            },
          )
          .join("")
      : '<p class="review-empty">Chưa có bình luận nào cho phim này. Hãy là người đầu tiên chia sẻ cảm nhận!</p>';
  }

  function bindWatchComments() {
    const form = document.querySelector("#watchCommentForm");
    if (!form) return;

    // Hiển thị identity row hoặc input nhập tên tùy theo trạng thái đăng nhập
    const session = getSession();
    const authorRow = document.querySelector("#watchAuthorRow");
    if (authorRow) {
      if (session?.name) {
        authorRow.innerHTML = `
          <div class="watch-comment-identity">
            <span class="detail-reply-avatar">${escapeHtml(session.name.charAt(0))}</span>
            <span>Bình luận với tư cách <strong>${escapeHtml(session.name)}</strong></span>
            ${session.role === "admin" ? '<span class="reply-admin-badge">ADMIN</span>' : ""}
          </div>
          <input id="watchCommentAuthor" type="text" value="${escapeHtml(session.name)}" readonly hidden>`;
      } else {
        authorRow.innerHTML = `
          <label class="sr-only" for="watchCommentAuthor">Tên của bạn</label>
          <input id="watchCommentAuthor" type="text" maxlength="30" placeholder="Tên hiển thị của bạn">`;
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const authorInput = document.querySelector("#watchCommentAuthor");
      const commentInput = document.querySelector("#watchCommentText");
      const hint = document.querySelector("#watchCommentHint");
      const author = authorInput.value.trim();
      const comment = commentInput.value.trim();

      if (!watchSelectedRating) {
        hint.textContent = "Hãy chọn số sao bạn muốn chấm.";
        hint.style.color = "#ff6b5c";
        return;
      }
      if (!author) {
        hint.textContent = "Hãy điền tên của bạn.";
        hint.style.color = "#ff6b5c";
        authorInput.focus();
        return;
      }
      if (!comment) {
        hint.textContent = "Hãy viết vài cảm nhận về phim.";
        hint.style.color = "#ff6b5c";
        commentInput.focus();
        return;
      }

      try {
        await addReview({
          movieTitle: current.title,
          author,
          rating: watchSelectedRating,
          comment,
        });
      } catch (error) {
        hint.textContent = error.message;
        hint.style.color = "#ff6b5c";
        return;
      }

      event.target.reset();
      watchSelectedRating = 0;
      document
        .querySelectorAll("#watchStarInput .star")
        .forEach((star) => star.classList.remove("filled"));
      hint.textContent = "Cảm ơn bạn, bình luận đã được gửi!";
      hint.style.color = "var(--accent)";
      renderWatchComments();
    });

    const commentList = document.querySelector("#watchCommentList");
    if (!commentList) return;

    commentList.addEventListener("click", async (event) => {
      const deleteButton = event.target.closest("[data-watch-delete-review]");
      if (!deleteButton || !isAdmin()) return;
      const review = getMovieReviews(current.title).find(
        (item) => item.id === deleteButton.dataset.watchDeleteReview,
      );
      if (!review || !window.confirm(`Xóa bình luận của ${review.author}?`))
        return;
      try {
        await deleteReview(review.id);
      } catch (error) {
        window.alert(error.message);
        return;
      }
      renderWatchComments();
    });

    commentList.addEventListener("submit", async (event) => {
      const replyForm = event.target.closest("[data-watch-reply]");
      if (!replyForm) return;
      event.preventDefault();
      const hint = replyForm.querySelector(".detail-reply-hint");
      const comment = replyForm.elements.comment.value.trim();
      try {
        if (!await addReviewReply(replyForm.dataset.watchReply, comment)) {
          hint.textContent = "Hãy đăng nhập để gửi câu trả lời.";
          hint.classList.add("is-error");
          return;
        }
      } catch (error) {
        hint.textContent = error.message;
        hint.classList.add("is-error");
        return;
      }
      renderWatchComments();
    });
  }

  function renderPlaylist() {
    document.querySelector("#playlistList").innerHTML = playlist
      .map(
        (item, index) => `
        <a class="similar-item playlist-item ${item.id === current.id ? "is-current" : ""}" href="/watch.html?id=${encodeURIComponent(item.id)}">
          <span class="playlist-order">${String(index + 1).padStart(2, "0")}</span>
          <span class="similar-thumb" style="background-image:url('${item.poster}')" aria-hidden="true"><span class="similar-play">${item.id === current.id ? "Ⅱ" : "▶"}</span></span>
          <span class="similar-copy">
            <strong>${item.title}</strong>
            <span>${item.year} · ${item.genre}</span>
            ${item.id === current.id ? '<span class="playlist-now">Đang phát</span>' : ""}
            <span class="watch-progress" data-progress-wrap="${item.id}" hidden>
              <span class="watch-progress-track"><span class="similar-progress" data-progress-for="${item.id}"></span></span>
              <span class="watch-progress-label" data-progress-label-for="${item.id}"></span>
            </span>
          </span>
        </a>`,
      )
      .join("");
    renderProgressBadges();
  }

  function renderSimilar() {
    document.querySelector("#watchSimilarList").innerHTML = similar
      .map(
        (item, index) => `
        <a class="similar-item recommendation-item" style="--item-index:${index}" href="/watch.html?id=${encodeURIComponent(item.id)}">
          <span class="similar-thumb" style="background-image:url('${item.poster}')" aria-hidden="true"><span class="similar-play">▶</span></span>
          <span class="similar-copy">
            <strong>${item.title}</strong>
            <span>${item.year}</span>
            <span class="recommendation-genre">${item.genre}</span>
          </span>
        </a>`,
      )
      .join("");
  }

  function loadSource(index, sourceOverride = null) {
    const source = sourceOverride || sources[index];
    activeSource = index;
    isEpisodeSourcePlaying = Boolean(sourceOverride);
    errorBox.hidden = true;
    emptyBox.hidden = true;

    document.querySelectorAll(".server-btn").forEach((button) => {
      const isActive = Number(button.dataset.server) === index;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!source) {
      showEmptyState();
      return;
    }

    openLink.href = source.watchUrl;
    openLink.hidden = !source.watchUrl;

    if (source.kind === "youtube") {
      mountYouTube(source);
      return;
    }
    mountVideo(source);
  }

  function showEmptyState() {
    teardownMedia();
    stage.innerHTML = "";
    emptyBox.hidden = false;
    controls.hidden = true;
    document.querySelector("#playerHint").hidden = true;
    spinner.hidden = true;
    openLink.hidden = true;
  }

  function mountYouTube(source) {
    teardownMedia();
    emptyBox.hidden = true;
    controls.hidden = false;
    openLink.hidden = !source.watchUrl;
    document.querySelector("#playerHint").hidden = false;
    spinner.hidden = false;

    stage.innerHTML = '<div id="ytHost" class="watch-embed"></div>';
    ytPlayer = createYouTubePlayer(source);
  }

  // YouTube IFrame API: giữ cho phím tắt, tua, tốc độ và xem lại vị trí đã dừng.
  function loadYouTubeApi() {
    if (ytReady || window.YT?.Player) {
      ytReady = true;
      return Promise.resolve(window.YT);
    }
    return new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        ytReady = true;
        if (typeof prev === "function") prev();
        resolve(window.YT);
      };
      if (!document.querySelector("script[data-yt-api]")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        tag.dataset.ytApi = "1";
        document.head.appendChild(tag);
      }
    });
  }

  function createYouTubePlayer(source) {
    const player = {
      kind: "youtube",
      source,
      api: null,
      state: "unstarted",
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      playbackRate: 1,
      seekTarget: null,
      seekTargetExpiresAt: 0,
      bufferedRatio: 0,
      destroyed: false,
    };

    loadYouTubeApi()
      .then((YT) => {
        if (player.destroyed || !YT?.Player) return;
        player.api = new YT.Player("ytHost", {
          videoId: source.videoId,
          playerVars: {
            rel: 0,
            autoplay: 1,
            modestbranding: 1,
            playsinline: 1,
            modestbranding: 1,
            controls: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => onYouTubeReady(player, event),
            onStateChange: (event) => onYouTubeState(player, event),
            onError: () => onYouTubeError(player),
          },
        });
      })
      .catch(() => {
        if (!player.destroyed) errorBox.hidden = false;
      });

    return player;
  }

  function onYouTubeReady(player, event) {
    if (player.destroyed) return;
    spinner.hidden = true;
    applyPrefsToPlayer(player);
    player.api.setVolume(player.volume * 100);
    player.api.setPlaybackRate(player.playbackRate);
    player.api.playVideo();

    player.duration = player.api.getDuration() || 0;
    document.querySelector("#totalTime").textContent = formatTime(
      player.duration,
    );

    if (resumeAt > 0 && resumeAt < player.duration - 15) {
      player.currentTime = resumeAt;
      player.api.seekTo(resumeAt, true);
      showResumeBar(resumeAt);
    }
    resumeAt = 0;
  }

  function onYouTubeState(player, event) {
    if (player.destroyed) return;
    const states = window.YT?.PlayerState || {};
    player.state = event.data;

    if (event.data === states.PLAYING) {
      spinner.hidden = true;
      errorBox.hidden = true;
      setPlayIcon(true);
      startYouTubeTicker(player);
    } else if (event.data === states.PAUSED || event.data === states.ENDED) {
      setPlayIcon(false);
      stopYouTubeTicker(player);
      if (
        event.data === states.ENDED &&
        isEpisodeSourcePlaying &&
        activeEpisode < episodeCount &&
        availableEpisodes.has(activeEpisode + 1)
      ) {
        confirmNextEpisode().then((shouldContinue) => {
          if (!shouldContinue) return;
          goToEpisode(activeEpisode + 1, { autoNext: true });
        });
      }
    }
  }

  function onYouTubeError(player) {
    if (player.destroyed) return;
    spinner.hidden = true;
    if (isEpisodeSourcePlaying || !sources.length || errorTried.has(activeSource)) {
      errorBox.hidden = false;
      return;
    }
    errorTried.add(activeSource);
    const next = (activeSource + 1) % sources.length;
    showToast(
      `${sources[activeSource].label} lỗi, đang thử ${sources[next].label}...`,
    );
    loadSource(next);
  }

  // YT API không có sự kiện timeupdate, nên tự poll mỗi 250ms khi đang phát.
  function startYouTubeTicker(player) {
    stopYouTubeTicker(player);
    player.timer = setInterval(() => {
      if (player.destroyed || !player.api) return;
      const time = player.api.getCurrentTime() || 0;
      const duration = player.api.getDuration() || 0;
      if (duration <= 0) return;
      if (player.seekTarget !== null) {
        if (
          Math.abs(time - player.seekTarget) <= 1 ||
          Date.now() >= player.seekTargetExpiresAt
        ) {
          player.seekTarget = null;
        }
      }
      player.currentTime = player.seekTarget ?? time;
      player.duration = duration;

      const ratio = player.currentTime / duration;
      seek.value = String(Math.round(ratio * 1000));
      seek.style.setProperty("--seek", `${ratio * 100}%`);
      document.querySelector("#currentTime").textContent = formatTime(
        player.currentTime,
      );
      saveProgress(player.currentTime, duration);
    }, 250);
  }

  function stopYouTubeTicker(player) {
    if (player.timer) clearInterval(player.timer);
    player.timer = null;
  }

  function mountVideo(source) {
    teardownMedia();
    emptyBox.hidden = true;
    controls.hidden = false;
    openLink.hidden = !source.watchUrl;
    document.querySelector("#playerHint").hidden = false;
    spinner.hidden = false;

    video = document.createElement("video");
    video.className = "watch-video";
    video.playsInline = true;
    video.preload = "metadata";
    video.poster = current.backdrop;
    const prefs = loadPrefs();
    video.volume = typeof prefs.volume === "number" ? prefs.volume : 1;
    video.muted = video.volume === 0;
    video.src = source.url;
    stage.innerHTML = "";
    stage.appendChild(video);
    setVolumeIcon();
    bindMediaElement(video);
    video.load();
    video.play().catch(() => {});
  }

  function teardownMedia() {
    if (ytPlayer) {
      stopYouTubeTicker(ytPlayer);
      try {
        ytPlayer.api?.destroy();
      } catch {
        /* player đã bị YouTube dọn sẵn */
      }
      ytPlayer.destroyed = true;
      ytPlayer = null;
    }
    if (!video) return;
    clearProgress(current.id);
    video.pause();
    video.removeAttribute("src");
    video.load();
    video = null;
  }

  function bindMediaElement(media) {
    const onMetadata = () => {
      spinner.hidden = true;
      document.querySelector("#totalTime").textContent = formatTime(
        media.duration,
      );
      if (resumeAt > 0 && resumeAt < media.duration - 15) {
        media.currentTime = resumeAt;
        showResumeBar(resumeAt);
      }
      resumeAt = 0;
    };

    media.addEventListener("loadedmetadata", onMetadata);
    if (media.readyState >= 1) onMetadata();

    media.addEventListener("waiting", () => {
      spinner.hidden = false;
    });
    media.addEventListener("playing", () => {
      spinner.hidden = true;
      errorBox.hidden = true;
      setPlayIcon(true);
    });
    media.addEventListener("canplay", () => {
      spinner.hidden = true;
    });
    media.addEventListener("play", () => setPlayIcon(true));
    media.addEventListener("pause", () => setPlayIcon(false));
    media.addEventListener("ended", () => {
      if (
        isEpisodeSourcePlaying &&
        activeEpisode < episodeCount &&
        availableEpisodes.has(activeEpisode + 1)
      ) {
        confirmNextEpisode().then((shouldContinue) => {
          if (!shouldContinue) return;
          goToEpisode(activeEpisode + 1, { autoNext: true });
        });
      }
    });

    media.addEventListener("error", () => {
      spinner.hidden = true;
      if (!sources.length || errorTried.has(activeSource)) {
        errorBox.hidden = false;
        return;
      }
      errorTried.add(activeSource);
      const next = (activeSource + 1) % sources.length;
      showToast(
        `${sources[activeSource].label} lỗi, đang thử ${sources[next].label}...`,
      );
      loadSource(next);
    });

    media.addEventListener("timeupdate", () => {
      if (!Number.isFinite(media.duration) || media.duration <= 0) return;
      const ratio = media.currentTime / media.duration;
      seek.value = String(Math.round(ratio * 1000));
      seek.style.setProperty("--seek", `${ratio * 100}%`);
      document.querySelector("#currentTime").textContent = formatTime(
        media.currentTime,
      );
      updateBuffered(media);
      saveProgress(media.currentTime, media.duration);
    });

    media.addEventListener("progress", () => updateBuffered(media));

    setPlayIcon(!media.paused);
  }

  function updateBuffered(media) {
    if (
      !media.buffered.length ||
      !Number.isFinite(media.duration) ||
      media.duration <= 0
    ) {
      bufferedBar.style.width = "0%";
      return;
    }
    const end = media.buffered.end(media.buffered.length - 1);
    bufferedBar.style.width = `${Math.min((end / media.duration) * 100, 100)}%`;
  }

  function bindServers() {
    document.querySelector("#serverList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-server]");
      if (!button) return;
      const index = Number(button.dataset.server);
      if (index === activeSource) return;
      loadSource(index);
      showToast(`Đang xem ${sources[index].label} · ${sources[index].variant}`);
    });
  }

  function bindSharedControls() {
    document
      .querySelector("#playToggle")
      .addEventListener("click", () => backend.toggle());

    document.querySelector("#fullscreenBtn").addEventListener("click", () => {
      const shell = document.querySelector("#playerShell");
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
        return;
      }
      shell.requestFullscreen?.().catch(() => {});
    });

    document.querySelector("#pipBtn").addEventListener("click", () => {
      if (backend.active !== "file" || !video) {
        showToast(
          "Nguồn YouTube chỉ hỗ trợ hình trong hình trong chế độ xem trước.",
        );
        return;
      }
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        return;
      }
      video.requestPictureInPicture?.().catch(() => {
        showToast("Trình duyệt không hỗ trợ hình trong hình.");
      });
    });

    document.querySelector("#playerRetry").addEventListener("click", () => {
      errorTried.clear();
      errorBox.hidden = true;
      loadSource(activeSource);
    });

    document.querySelector("#resumeBtn").addEventListener("click", () => {
      const target = Number(
        document.querySelector("#resumeBar").dataset.time || 0,
      );
      backend.seekTo(target);
      backend.play();
      hideResumeBar();
    });
    document.querySelector("#restartBtn").addEventListener("click", () => {
      backend.seekTo(0);
      backend.play();
      hideResumeBar();
    });

    seek.addEventListener("input", () => {
      seek.style.setProperty("--seek", `${(Number(seek.value) / 1000) * 100}%`);
    });
    seek.addEventListener("change", () => {
      const total = backend.duration;
      if (!Number.isFinite(total) || total <= 0) return;
      backend.seekTo((Number(seek.value) / 1000) * total);
    });

    document
      .querySelector("#backBtn")
      .addEventListener("click", () => backend.seekTo(backend.time - 10));
    document
      .querySelector("#forwardBtn")
      .addEventListener("click", () => backend.seekTo(backend.time + 10));

    volumeRange.addEventListener("input", () => {
      backend.setVolume(Number(volumeRange.value) / 100);
      setVolumeIcon();
      savePrefs();
    });

    document
      .querySelector("#muteBtn")
      .addEventListener("click", () => backend.toggleMute());

    document
      .querySelector("#speedSelect")
      .addEventListener("change", (event) => {
        backend.setSpeed(Number(event.target.value));
        savePrefs();
      });

    setVolumeIcon();
  }

  function showResumeBar(time) {
    const bar = document.querySelector("#resumeBar");
    bar.dataset.time = String(time);
    document.querySelector("#resumeTime").textContent = formatTime(time);
    bar.hidden = false;
  }

  function hideResumeBar() {
    const bar = document.querySelector("#resumeBar");
    bar.hidden = true;
    delete bar.dataset.time;
  }

  function bindKeyboard() {
    document.addEventListener("keydown", (event) => {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      if (event.key === "f") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (!backend.active) return;

      const actions = {
        " ": () => backend.toggle(),
        k: () => backend.toggle(),
        ArrowLeft: () => backend.seekTo(backend.time - 5),
        ArrowRight: () => backend.seekTo(backend.time + 5),
        j: () => backend.seekTo(backend.time - 10),
        l: () => backend.seekTo(backend.time + 10),
        ArrowUp: () => changeVolume(0.1),
        ArrowDown: () => changeVolume(-0.1),
        m: () => backend.toggleMute(),
      };

      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    });

    function changeVolume(delta) {
      const next = Math.min(Math.max(backend.volume + delta, 0), 1);
      backend.setVolume(next);
      volumeRange.value = String(Math.round(next * 100));
      setVolumeIcon();
      savePrefs();
    }
  }

  function bindToolbar() {
    const favorites = loadFavorites();
    const favoriteBtn = document.querySelector('[data-tool="favorite"]');
    const shareTrigger = document.querySelector('[data-tool="share"]');

    const syncState = () => {
      const saved = favorites.includes(current.id);
      favoriteBtn.setAttribute("aria-pressed", String(saved));
      favoriteBtn.classList.toggle("is-active", saved);
      favoriteBtn.querySelector("span").textContent = saved
        ? "Đã lưu"
        : "Yêu thích";
    };

    favoriteBtn.addEventListener("click", () => {
      const next = toggleFavoriteStorage(current.id);
      favorites.length = 0;
      favorites.push(...next);
      syncState();
      showToast(
        next.includes(current.id)
          ? `Đã lưu "${current.title}".`
          : `Đã xoá "${current.title}" khỏi danh sách.`,
      );
    });

    document
      .querySelector(".detail-toolbar")
      .addEventListener("click", (event) => {
        if (!event.target.closest('[data-tool="share"]')) return;
        const isOpen = sharePanel.hasAttribute("hidden");
        sharePanel.toggleAttribute("hidden", !isOpen);
        shareTrigger.setAttribute("aria-expanded", String(isOpen));
      });
  }

  function loadPlayerPrefs() {
    const prefs = loadPrefs();
    if (typeof prefs.volume === "number") {
      volumeRange.value = String(Math.round(prefs.volume * 100));
    }
    if (typeof prefs.speed === "number") {
      document.querySelector("#speedSelect").value = String(prefs.speed);
    }
    // Chỉ ghi nhớ server nếu phim này thực sự có nhiều nguồn.
    if (
      typeof prefs.source === "number" &&
      sources.length > 1 &&
      sources[prefs.source]
    ) {
      activeSource = prefs.source;
    }
    resumeAt = readProgress(current.id);
  }

  function savePrefs() {
    saveJson(PREFS_KEY, {
      volume: backend.volume,
      speed: backend.speed,
      source: activeSource,
    });
  }

  function saveProgress(time, duration) {
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (time < 15 || time > duration - 20) {
      clearProgress(current.id);
      return;
    }
    const all = loadProgressAll();
    all[current.id] = { time, duration, updatedAt: Date.now() };
    saveJson(PROGRESS_KEY, all);
    renderProgressBadges();
  }

  function clearProgress(id) {
    const all = loadProgressAll();
    if (!all[id]) return;
    delete all[id];
    saveJson(PROGRESS_KEY, all);
    renderProgressBadges();
  }

  function renderProgressBadges() {
    const all = loadProgressAll();
    document.querySelectorAll("[data-progress-for]").forEach((node) => {
      const entry = all[node.dataset.progressFor];
      const wrapper = node.closest("[data-progress-wrap]");
      if (!entry || !entry.duration) {
        if (wrapper) wrapper.hidden = true;
        node.style.width = "0%";
        return;
      }
      const percent = Math.min((entry.time / entry.duration) * 100, 100);
      node.style.width = `${percent}%`;
      if (wrapper) wrapper.hidden = false;
      const label = document.querySelector(
        `[data-progress-label-for="${node.dataset.progressFor}"]`,
      );
      if (label) label.textContent = `Đã xem ${formatTime(entry.time)}`;
    });
  }
}

function toggleFullscreen() {
  const shell = document.querySelector("#playerShell");
  if (!shell) return;
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
    return;
  }
  shell.requestFullscreen?.().catch(() => {});
}

const PREFS_KEY = "movieverse_player_prefs";

function loadPrefs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}
  return {};
}

function readProgress(id) {
  const entry = loadProgressAll()[id];
  return entry && typeof entry.time === "number" ? entry.time : 0;
}

function loadProgressAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      return parsed;
  } catch (_) {}
  return {};
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
}

function bindShareButtons(pageUrl, shareText) {
  const PLATFORM_URLS = {
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    tiktok: "https://www.tiktok.com/",
    instagram: "https://www.instagram.com/",
  };

  document.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", async () => {
      const platform = button.dataset.share;

      if (
        platform === "copy" ||
        platform === "tiktok" ||
        platform === "instagram"
      ) {
        const copied = await copyText(`${shareText} — ${pageUrl}`);
        if (platform === "copy") {
          showToast(
            copied
              ? "Đã sao chép link phim."
              : "Không sao chép được, hãy copy từ thany địa chỉ.",
          );
          return;
        }
        const label = platform === "tiktok" ? "TikTok" : "Instagram";
        showToast(
          copied
            ? `Đã sao chép link — dán vào bài đăng ${label} của bạn.`
            : `Mở ${label} để chia sẻ phim này.`,
        );
        window.open(PLATFORM_URLS[platform], "_blank", "noopener");
        return;
      }

      const shareUrl = `${PLATFORM_URLS.facebook}${encodeURIComponent(pageUrl)}`;
      window.open(shareUrl, "facebook-share", "width=640,height=560");
    });
  });
}

function bindMenuToggle() {
  const menuToggle = document.querySelector(".menu-toggle");
  if (!menuToggle) return;
  menuToggle.addEventListener("click", () => {
    const isOpen = document
      .querySelector(".main-nav")
      .classList.toggle("mobile-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function loadWatchlist() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WATCHLIST_KEY));
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return [];
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch (_) {
    return false;
  }
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#watchToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
