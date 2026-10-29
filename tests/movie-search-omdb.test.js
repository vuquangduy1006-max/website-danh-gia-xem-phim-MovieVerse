import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("server supports searching movie suggestions via OMDb when TMDb is unavailable", async () => {
  const serverJs = await readFile(new URL("server.js", projectRoot), "utf8");
  const adminJs = await readFile(new URL("src/data/admin.js", projectRoot), "utf8");
  const authJs = await readFile(new URL("src/data/auth.js", projectRoot), "utf8");

  // Verify server.js defines searchOmdbMovies
  assert.match(serverJs, /async function searchOmdbMovies\(query\)/);
  assert.match(serverJs, /upstreamUrl\.searchParams\.set\("s", query\)/);

  // Verify server.js falls back to OMDb in isMovieSearchLookup
  assert.match(serverJs, /searchOmdbMovies\(query\)/);
  assert.match(serverJs, /!tmdbApiKey && !omdbApiKey/);

  // Verify server.js supports lookup by imdbId
  assert.match(serverJs, /url\.searchParams\.get\("imdbId"\)/);
  assert.match(serverJs, /upstreamUrl\.searchParams\.set\("i", imdbId\)/);

  // Verify admin.js passes imdbId and renders API suggestions
  assert.match(adminJs, /data-imdb-id/);
  assert.match(adminJs, /lookupMovieDetails\(titleInput\.value, button\.dataset\.imdbId\)/);
  assert.match(adminJs, /Chọn phim trong kho hoặc gợi ý từ API/);
  assert.match(adminJs, /query\.length < 3/);
  assert.match(adminJs, /setTimeout\([\s\S]*?,\s*450/);
  assert.match(adminJs, /setTimeout\(\(\) => lookupMovieDetails\(title\), 1200\)/);
  assert.match(adminJs, /Tìm thấy từ API/);
  assert.match(adminJs, /result\.warning/);
  assert.match(serverJs, /describeMovieProviderFailure\(provider, error\)/);
  assert.match(serverJs, /từ chối xác thực \(HTTP \$\{status\}\)/);
  assert.match(serverJs, /bị từ chối kết nối \(ECONNREFUSED\); kiểm tra DNS, firewall/);
  assert.match(adminJs, /Đang có trong kho/);
  assert.match(adminJs, /related-movie-poster-placeholder/);
  assert.match(adminJs, /movieSearchRequestId/);
  assert.match(adminJs, /localTitlesAndYears/);
  assert.match(adminJs, /clearAdminSession\(session\.adminToken\)/);
  assert.match(adminJs, /Phiên quản trị đã hết hạn hoặc không hợp lệ/);
  assert.match(authJs, /export function clearAdminSession\(adminToken\)/);
  assert.match(authJs, /session\.adminToken !== adminToken/);
});
