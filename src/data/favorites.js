const FAVORITES_KEY = "movieverse_favorites";

export function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    if (!Array.isArray(saved)) return [];
    return [...new Set(saved.filter((id) => typeof id === "string"))];
  } catch (_) {
    return [];
  }
}

export function saveFavorites(ids) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === "string"))];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds));
  return uniqueIds;
}

export function isFavorite(movieId) {
  return loadFavorites().includes(movieId);
}

export function toggleFavorite(movieId) {
  const favorites = loadFavorites();
  const next = favorites.includes(movieId)
    ? favorites.filter((id) => id !== movieId)
    : [...favorites, movieId];
  return saveFavorites(next);
}

export function removeFavorite(movieId) {
  return saveFavorites(loadFavorites().filter((id) => id !== movieId));
}
