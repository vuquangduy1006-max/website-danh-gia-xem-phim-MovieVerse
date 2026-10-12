export function isValidReleaseYear(value, currentYear = new Date().getFullYear()) {
  const year = String(value).trim();
  return /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= currentYear;
}
