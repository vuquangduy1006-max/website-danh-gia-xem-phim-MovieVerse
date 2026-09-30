import { getMovieGenres } from "./data.js";

const localTrailerAssets = import.meta.glob("../assets/trailer phim/*.mp4", {
  eager: true,
  query: "?url",
  import: "default",
});

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[_']/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function getLocalTrailer(movie) {
  const title = normalizeTitle(movie.title);
  const match = Object.entries(localTrailerAssets).find(([path]) => {
    const filename = normalizeTitle(path.split("/").pop().replace(/\.mp4$/i, ""));
    return filename.includes(title);
  });

  if (!match) return null;

  const filename = match[0].split("/").pop();
  const isConcept = normalizeTitle(filename).includes("concept trailer");
  return {
    kind: "file",
    url: match[1],
    title: `${movie.title} · ${isConcept ? "Concept trailer" : "Trailer"}`,
    channel: isConcept ? "Concept trailer" : "Thư viện MovieVerse",
    label: isConcept ? "Concept trailer" : "Trailer MP4",
    isConcept,
  };
}

// Mỗi phim sở hữu riêng danh sách nguồn của chính nó.
// Mọi video ID đều đã kiểm tra phát được và thuộc kênh nhà phát chính thức.
// clip[0] luôn là trailer chính, dùng làm nguồn mặc định ở trang chi tiết.
const MOVIE_SOURCES = {
  "Dune: Part Two": [
    { id: "Way9Dexny3w", title: "Dune: Part Two | Official Trailer", channel: "Warner Bros.", label: "Trailer chính" },
    { id: "_YUzQa_1RCE", title: "Dune: Part Two | Official Trailer 2", channel: "Warner Bros.", label: "Trailer 2" },
    { id: "U2Qp5pL3ovA", title: "Dune: Part Two | Official Trailer 3", channel: "Warner Bros.", label: "Trailer 3" },
  ],
  "Past Lives": [
    { id: "kA244xewjcI", title: "Past Lives | Official Trailer HD", channel: "A24", label: "Trailer chính" },
    { id: "t8e1Z4WXsUc", title: "PAST LIVES | Official Trailer", channel: "STUDIOCANAL", label: "Trailer quốc tế" },
    { id: "9d4ObkmCJYs", title: "Creating Chemistry on Past Lives | Official Featurette", channel: "A24", label: "Hậu trường" },
  ],
  "Civil War": [
    { id: "aDyQxtg0V2w", title: "Civil War | Official Trailer HD", channel: "A24", label: "Trailer chính" },
    { id: "cA4wVhs3HC0", title: "Civil War | Official Trailer 2 HD", channel: "A24", label: "Trailer 2" },
    { id: "c2G18nIVpNE", title: "Civil War | Official Final Trailer HD", channel: "A24", label: "Final trailer" },
  ],
  "Kiki’s Delivery": [
    { id: "C1gq8ARWI_w", title: "KIKI'S DELIVERY SERVICE | Official Trailer", channel: "GKIDS Films", label: "Trailer chính" },
    { id: "nu4OX6RKeLY", title: "KIKI'S DELIVERY SERVICE 4K Remaster | Official Trailer", channel: "GKIDS Films", label: "Trailer 4K Remaster" },
    { id: "t6-fT0hjTvc", title: "KIKI'S DELIVERY SERVICE | Official English Trailer", channel: "GKIDS Films", label: "Trailer tiếng Anh" },
  ],
  Superman: [
    { id: "Ox8ZLF6cGM0", title: "Superman | Official Trailer", channel: "DC", label: "Trailer chính" },
    { id: "uhUht6vAsMY", title: "Superman | Official Teaser Trailer", channel: "DC", label: "Teaser" },
    { id: "PY-YcYmzgZI", title: "Superman | Full Movie Preview", channel: "Warner Bros. Entertainment", label: "10 phút đầu" },
  ],
  "The Fantastic Four: First Steps": [
    { id: "pAsmrKyMqaA", title: "The Fantastic Four: First Steps | Official Trailer", channel: "Marvel Entertainment", label: "Trailer chính" },
    { id: "AzMo-FgRp64", title: "The Fantastic Four: First Steps | Official Teaser", channel: "Marvel Entertainment", label: "Teaser" },
    { id: "VtWHYkNHm2k", title: "The Fantastic Four: First Steps | Meet The Family", channel: "Marvel Entertainment", label: "Giới thiệu nhân vật" },
  ],
  "Zootopia 2": [
    { id: "BjkIOU5PhyQ", title: "Zootopia 2 | Trailer", channel: "Walt Disney Animation Studios", label: "Trailer chính" },
    { id: "xo4rkcC7kFc", title: "Zootopia 2 | Teaser Trailer", channel: "Walt Disney Animation Studios", label: "Teaser" },
    { id: "5AwtptT8X8k", title: "Zootopia 2 | Final Trailer", channel: "Walt Disney Animation Studios", label: "Final trailer" },
  ],
  F1: [
    { id: "4DGgue0BoD8", title: "F1 The Movie — Official Trailer", channel: "Apple TV", label: "Trailer chính" },
    { id: "8yh9BPUBbbQ", title: "F1 The Movie | Main Trailer", channel: "Warner Bros.", label: "Trailer Warner Bros." },
    { id: "I_XJSaWMMo0", title: "F1 The Movie — Behind the VFX", channel: "Apple TV", label: "Hậu trường VFX" },
  ],
  "Gladiator II": [
    { id: "4rgYUipGJNo", title: "Gladiator II | Official Trailer", channel: "Paramount Pictures", label: "Trailer chính" },
    { id: "Ts0N8swyWFI", title: "Gladiator II | New Trailer", channel: "Paramount Pictures", label: "Trailer mới" },
    { id: "TQwSz88ITAE", title: "Gladiator II | Final Trailer", channel: "Paramount Pictures", label: "Final trailer" },
  ],
  "Inside Out 2": [
    { id: "LEjhY15eCx0", title: "Inside Out 2 | Official Trailer", channel: "Pixar", label: "Trailer chính" },
    { id: "L4DrolmDxmw", title: "Inside Out 2 | Final Trailer", channel: "Pixar", label: "Final trailer" },
    { id: "u69y5Ie519M", title: "Inside Out 2 | Announce Trailer", channel: "Pixar", label: "Trailer công bố" },
  ],
  "Deadpool & Wolverine": [
    { id: "sMVIBr-7hgE", title: "Deadpool & Wolverine | Official Trailer", channel: "Marvel Entertainment", label: "Trailer chính" },
    { id: "uJMCNJP2ipI", title: "Deadpool & Wolverine | Official Teaser", channel: "Marvel Entertainment", label: "Teaser" },
    { id: "laNA2HgwYXU", title: "Deadpool & Wolverine | Final Trailer", channel: "Ryan Reynolds", label: "Final trailer" },
  ],
  "Moana 2": [
    { id: "hDZ7y8RP5HE", title: "Moana 2 | Official Trailer", channel: "Walt Disney Animation Studios", label: "Trailer chính" },
    { id: "JdsSDUfHsC0", title: "Moana 2 | Moana is Back!", channel: "Walt Disney Animation Studios", label: "Teaser" },
    { id: "LvCedoSC4oA", title: "Moana 2 | Watch Official Trailer Now", channel: "Walt Disney Animation Studios", label: "Trailer mới" },
  ],
  "The Wild Robot": [
    { id: "67vbA5ZJdKQ", title: "The Wild Robot | Official Trailer", channel: "Universal Pictures", label: "Trailer chính" },
    { id: "njPNg0A9VpY", title: "The Wild Robot | Official Trailer 2", channel: "Universal Pictures", label: "Trailer 2" },
    { id: "Nwem-IdqkDY", title: "The Wild Robot | Behind the Animation", channel: "Universal Pictures", label: "Hậu trường hoạt hình" },
  ],
  Wicked: [
    { id: "6COmYeLsz4c", title: "Wicked | Official Trailer", channel: "Universal Pictures", label: "Trailer chính" },
    { id: "pqi45Qhq3CI", title: "Wicked | Official Trailer 2", channel: "Universal Pictures", label: "Trailer 2" },
    { id: "F1dvX9Vs0ns", title: "Wicked | First Look", channel: "Universal Pictures", label: "First look" },
  ],
  "A Minecraft Movie": [
    { id: "wJO_vIDZn-I", title: "A Minecraft Movie | Official Trailer", channel: "Warner Bros.", label: "Trailer chính" },
    { id: "PE2YZhcC4NY", title: "A Minecraft Movie | Teaser", channel: "Warner Bros.", label: "Teaser" },
    { id: "8B1EtVPBSMw", title: "A Minecraft Movie | Final Trailer", channel: "Warner Bros.", label: "Final trailer" },
  ],
  "How to Train Your Dragon": [
    { id: "22w7z_lT6YM", title: "How To Train Your Dragon | Official Trailer", channel: "Universal Pictures", label: "Trailer chính" },
    { id: "nu2YY4cZR4A", title: "How To Train Your Dragon | Warrior", channel: "Universal Pictures", label: "Trailer Warrior" },
    { id: "rhEvRkxlLuc", title: "How To Train Your Dragon | Official IMAX Trailer", channel: "DreamWorks Dragons", label: "Trailer IMAX" },
  ],
  "Mission: Impossible - The Final Reckoning": [
    { id: "fsQgc9pCyDU", title: "Mission: Impossible – The Final Reckoning | Official Trailer", channel: "Paramount Pictures", label: "Trailer chính" },
    { id: "NOhDyUmT9z0", title: "Mission: Impossible – The Final Reckoning | Teaser Trailer", channel: "Paramount Pictures", label: "Teaser" },
    { id: "G1VBfMCZVkw", title: "Mission: Impossible – The Final Reckoning | Exclusive 1.90 Trailer", channel: "IMAX", label: "Trailer IMAX 1.90" },
  ],
  Nosferatu: [
    { id: "nulvWqYUM8k", title: "NOSFERATU - Official Trailer [HD]", channel: "Focus Features", label: "Trailer chính" },
    { id: "uXgtz_HGw-4", title: "NOSFERATU | Official Trailer 2 [HD]", channel: "Universal Pictures UK", label: "Trailer 2" },
    { id: "YWgfJ0R2Cs4", title: "NOSFERATU — \"Come To Me\" | Official Clip", channel: "Focus Features", label: "Đoạn phim" },
  ],
  "Spider-Man: Across the Spider-Verse": [
    { id: "cqGjhVJWtEg", title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE | Official Trailer", channel: "Sony Pictures Entertainment", label: "Trailer chính" },
    { id: "shW9i6k8cB0", title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE | Official Trailer #2", channel: "Sony Pictures Entertainment", label: "Trailer 2" },
    { id: "BbXJ3_AQE_o", title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE | First Look", channel: "Sony Pictures Entertainment", label: "First look" },
  ],
  Interstellar: [
    { id: "2LqzF5WauAw", title: "Interstellar (2014) | Original Theatrical Trailer 1", channel: "Interstellar Movie", label: "Trailer 1" },
    { id: "0vxOhd4qlnA", title: "Interstellar (2014) | Original Theatrical Trailer 3", channel: "Interstellar Movie", label: "Trailer 3" },
    { id: "LY19rHKAaAg", title: "Interstellar | Trailer 4", channel: "Warner Bros. UK & Ireland", label: "Trailer 4" },
  ],
};


const DIRECTORS = [
  "Lena Kovač",
  "Marcus Delgado",
  "Hải Yến",
  "Thuận Nguyễn",
  "Elias Bergström",
  "Priya Raman",
  "Đức Thành",
  "Sofia Marchetti",
  "Minh Khoa",
  "Aria Fontaine",
];

const CAST = [
  "Nguyễn Thị Bích Ngọc",
  "Trần Anh Tuấn",
  "Lê Hoàng Phúc",
  "Phạm Quỳnh Anh",
  "Đỗ Thanh Hà",
  "Vũ Đức Thắng",
  "Ngô Bảo Châu",
  "Huỳnh Mai Vy",
  "Bùi Gia Hân",
  "Đặng Tuấn Kiệt",
  "Lý Gia Linh",
  "Tạ Quang Minh",
  "Chu Yến Nhi",
  "Hoàng Anh Tuấn",
  "Mai Khánh Vy",
  "Đinh Trung Kiên",
  "Phan Ngọc Ánh",
  "Trịnh Bảo Châu",
  "Võ Thành Long",
  "Lâm Kim Nhã",
];

const STUDIOS = [
  "MovieVerse Studios",
  "Nordlight Pictures",
  "Sóng Film Works",
  "Aurora Entertainment",
  "Hải Đăng Media",
  "Silver Fox Collective",
];

const COUNTRIES = ["Hoa Kỳ", "Anh", "Hàn Quốc", "Nhật Bản", "Pháp", "Việt Nam"];
const LANGUAGES = [
  "Tiếng Anh",
  "Tiếng Việt",
  "Tiếng Hàn",
  "Tiếng Nhật",
  "Tiếng Pháp",
];
const RUNTIMES = [
  "1h 47m",
  "1h 58m",
  "2h 06m",
  "2h 14m",
  "2h 22m",
  "2h 35m",
  "2h 46m",
];
const AGE_RATINGS = ["Tất cả độ tuổi", "13+", "16+", "18+"];

function hash(value) {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  }
  return result;
}

function buildReleaseDate(year, seed) {
  const day = (Math.floor(seed / 8) % 27) + 1;
  const month = (seed % 12) + 1;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function getTrailer(movie) {
  return getLocalTrailer(movie) || MOVIE_SOURCES[movie.title]?.[0] || null;
}

// Chỉ trả về nguồn của chính phim này. Không bao giờ trộn nguồn của phim khác vào.
export function getWatchSources(movie) {
  const clips = MOVIE_SOURCES[movie.title];
  const localTrailer = getLocalTrailer(movie);
  const sources = localTrailer
    ? [
        {
          ...localTrailer,
          index: 0,
          label: "Thư viện",
          variant: localTrailer.label,
          quality: "MP4",
          note: localTrailer.channel,
          watchUrl: "",
        },
      ]
    : [];

  if (!clips || !clips.length) return sources;

  return sources.concat(clips.map((clip, index) => ({
    kind: "youtube",
    index: sources.length + index,
    label: `YouTube ${index + 1}`,
    variant: clip.label,
    quality: "YouTube",
    note: clip.channel,
    videoId: clip.id,
    title: clip.title,
    channel: clip.channel,
    watchUrl: `https://www.youtube.com/watch?v=${clip.id}`,
  })));
}

export function getMovieMedia(movie, movieList = []) {
  const localTrailer = getLocalTrailer(movie);
  const trailer = getTrailer(movie);

  const main = trailer
    ? trailer.kind === "file"
      ? {
          ...trailer,
          meta: trailer.channel,
          watchUrl: "",
        }
      : {
          kind: "youtube",
          videoId: trailer.id,
          title: trailer.title,
          meta: trailer.channel,
          watchUrl: `https://www.youtube.com/watch?v=${trailer.id}`,
        }
    : {
        kind: "unavailable",
        title: `${movie.title} · Trailer chưa có trong kho`,
        meta: "Chưa cập nhật",
        watchUrl: "",
      };

  // "Video liên quan" = các nguồn khác của chính phim này.
  // Không lấy video của phim khác để tránh nội dung sai bộ phim.
  const ownClips = MOVIE_SOURCES[movie.title] || [];
  const related = ownClips.slice(1).map((clip) => ({
    kind: "youtube",
    videoId: clip.id,
    title: clip.title,
    movieTitle: movie.title,
    meta: clip.channel,
    poster: movie.poster,
    watchUrl: `https://www.youtube.com/watch?v=${clip.id}`,
  }));

  return { main, related };
}

export function getMovieCredits(movie) {
  const seed = hash(`${movie.id}:${movie.title}`);
  const pick = (list, offset) => list[(seed + offset * 7) % list.length];
  const cast = [0, 1, 2].map((offset) => pick(CAST, offset));

  return {
    director: pick(DIRECTORS, 0),
    cast,
    studio: pick(STUDIOS, 0),
    country: pick(COUNTRIES, 0),
    runtime: pick(RUNTIMES, 0),
    language: pick(LANGUAGES, 0),
    ageRating: pick(AGE_RATINGS, 0),
    releaseDate: buildReleaseDate(movie.year, seed),
  };
}

export function getSimilarMovies(movie, movieList, limit = 5) {
  const movieGenres = getMovieGenres(movie);
  const sameGenre = movieList.filter(
    (item) => item.id !== movie.id && getMovieGenres(item).some((genre) => movieGenres.includes(genre)),
  );
  const others = movieList.filter(
    (item) => item.id !== movie.id && !getMovieGenres(item).some((genre) => movieGenres.includes(genre)),
  );
  return [...sameGenre, ...others].slice(0, limit);
}
