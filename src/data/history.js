import { getSession } from "./auth.js";

const HISTORY_KEY = "movieverse_watch_history";

function getHistoryKey() {
  const session = getSession();
  return session ? `${HISTORY_KEY}_${session.id}` : `${HISTORY_KEY}_guest`;
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const id = typeof entry.id === "string" ? entry.id : "";
  if (!id) return null;

  return {
    id,
    viewedAt: Number(entry.viewedAt) || Date.now(),
    title: typeof entry.title === "string" ? entry.title : "",
    poster: typeof entry.poster === "string" ? entry.poster : "",
    genre: typeof entry.genre === "string" ? entry.genre : "",
    year: typeof entry.year === "string" || typeof entry.year === "number" ? String(entry.year) : "",
  };
}

export function loadWatchHistory() {
  try {
    const key = getHistoryKey();
    const saved = JSON.parse(localStorage.getItem(key));
    const entries = Array.isArray(saved) ? saved : [];
    return entries
      .map(normalizeEntry)
      .filter(Boolean)
      .sort((a, b) => b.viewedAt - a.viewedAt);
  } catch (_) {
    return [];
  }
}

export function saveWatchHistory(entries) {
  const unique = [];
  const seen = new Set();

  for (const item of Array.isArray(entries) ? entries : []) {
    const normalized = normalizeEntry(item);
    if (!normalized || seen.has(normalized.id)) continue;
    seen.add(normalized.id);
    unique.push(normalized);
  }

  const sorted = unique.sort((a, b) => b.viewedAt - a.viewedAt);
  localStorage.setItem(getHistoryKey(), JSON.stringify(sorted));
  return sorted;
}

export function addToWatchHistory(movieId, movieInfo = {}) {
  if (!movieId || typeof movieId !== "string") return loadWatchHistory();

  const history = loadWatchHistory();
  const next = [
    {
      id: movieId,
      viewedAt: Date.now(),
      title: movieInfo.title || "",
      poster: movieInfo.poster || "",
      genre: movieInfo.genre || "",
      year: movieInfo.year || "",
    },
    ...history.filter((entry) => entry.id !== movieId),
  ];

  return saveWatchHistory(next);
}

export function removeHistoryItem(movieId) {
  return saveWatchHistory(loadWatchHistory().filter((entry) => entry.id !== movieId));
}

export function clearWatchHistory() {
  localStorage.removeItem(getHistoryKey());
  return [];
}
