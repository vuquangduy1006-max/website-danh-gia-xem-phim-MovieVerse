export function isValidReleaseYear(value, currentYear = new Date().getFullYear()) {
  const year = String(value).trim();
  return /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= currentYear;
}

export function isValidMediaUrl(value) {
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    const isYouTube =
      host === "youtu.be" ||
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com");
    if (!isYouTube) return true;

    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") ||
          url.pathname.match(/\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
    return Boolean(videoId && /^[\w-]{11}$/.test(videoId));
  } catch {
    return false;
  }
}
