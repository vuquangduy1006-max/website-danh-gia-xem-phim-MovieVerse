const KNOWN_MOVIE_FACTS = new Map([
  [
    "dune: part two",
    {
      genres: ["Hành động"],
      runtimeMinutes: 166,
    },
  ],
]);

const GENRE_TERMS = [
  { genre: "Hành động", terms: ["hanh dong", "action"] },
  {
    genre: "Khoa học viễn tưởng",
    terms: ["khoa hoc vien tuong", "sci fi", "science fiction"],
  },
  { genre: "Phiêu lưu", terms: ["phieu luu", "adventure"] },
  {
    genre: "Hài",
    terms: ["phim hai", "the loai hai", "hai huoc", "comedy"],
  },
  { genre: "Tình cảm", terms: ["tinh cam", "lang man", "romance"] },
  { genre: "Kinh dị", terms: ["kinh di", "ma", "horror"] },
  { genre: "Hoạt hình", terms: ["hoat hinh", "animation"] },
  { genre: "Gia đình", terms: ["gia dinh", "family"] },
  { genre: "Tâm lý", terms: ["tam ly", "drama"] },
  { genre: "Bí ẩn", terms: ["bi an", "mystery"] },
  { genre: "Tội phạm", terms: ["toi pham", "crime"] },
];

const MOOD_RULES = [
  {
    name: "tâm trạng buồn, muốn được đồng cảm",
    terms: [
      "buon",
      "buon ba",
      "co don",
      "tam trang xuong",
      "tui than",
      "muon khoc",
      "can mot bo phim buon",
      "chia tay",
      "that tinh",
      "sad",
      "lonely",
      "heartbroken",
    ],
    genres: ["Tâm lý", "Tình cảm", "Chính kịch"],
    contentTerms: [
      "ban thoi tho au",
      "gap lai",
      "chua tung noi",
      "doi mat",
      "so phan",
      "tinh ban",
      "tinh cam",
    ],
    reason: "câu chuyện sâu lắng, giàu cảm xúc và sự đồng cảm",
  },
  {
    name: "cần được an ủi",
    terms: [
      "tam trang khong tot",
      "chan nan",
      "that vong",
      "ap luc",
      "met moi",
      "stress",
      "cang thang",
      "ngay met moi",
      "stressful day",
      "lo lang",
      "bat an",
      "muon duoc an ui",
      "can duoc dong vien",
      "muon vui len",
      "chua lanh",
      "cheer me up",
      "comfort",
      "stressed",
    ],
    genres: ["Hoạt hình", "Gia đình", "Hài", "Tình cảm"],
    contentTerms: [
      "am ap",
      "tinh ban",
      "cham soc",
      "cuoc song moi",
      "hanh trinh",
      "gia dinh",
      "vui",
    ],
    reason: "nhẹ nhàng, ấm áp để bạn thư giãn",
  },
  {
    name: "muốn vui vẻ, giải trí",
    terms: [
      "muon cuoi",
      "can tieng cuoi",
      "xem gi cho vui",
      "vui ve",
      "vui",
      "chan",
      "buon chan",
      "phan khoi",
      "hao hung",
      "hanh phuc",
      "phan khoi",
      "giai tri",
      "hai huoc",
      "tam trang vui",
      "cheerful",
      "bored",
      "funny",
    ],
    genres: ["Hài", "Hoạt hình"],
    contentTerms: [
      "hai huoc",
      "hai huoc",
      "hon loan",
      "phieu luu",
      "the gioi ky dieu",
    ],
    reason: "không khí vui vẻ, giải trí",
  },
  {
    name: "muốn hồi hộp, kịch tính",
    terms: [
      "hoi hop",
      "kich tinh",
      "gay can",
      "cam giac manh",
      "khong the roi mat",
      "muon xem gi do kich tinh",
      "hoi hop nhat",
      "phim gay can",
      "thrilling",
      "excited",
    ],
    genres: ["Hành động", "Bí ẩn", "Tội phạm", "Khoa học viễn tưởng"],
    contentTerms: [
      "chay dua",
      "doi mat",
      "bao ve",
      "dau truong",
      "moi de doa",
      "tra thu",
    ],
    reason: "nhịp phim kịch tính, nhiều hồi hộp",
  },
  {
    name: "muốn lãng mạn",
    terms: [
      "lang man",
      "tinh yeu",
      "chuyen tinh",
      "muon yeu",
      "tinh cam",
      "nho nguoi yeu",
      "romantic",
    ],
    genres: ["Tình cảm", "Tâm lý", "Chính kịch"],
    contentTerms: [
      "tinh yeu",
      "tinh ban",
      "ban be",
      "gap lai",
      "tinh ban thoi tho au",
      "tinh cam",
    ],
    reason: "câu chuyện giàu cảm xúc về tình cảm và các mối quan hệ",
  },
  {
    name: "muốn tìm cảm hứng, hy vọng",
    terms: [
      "can dong luc",
      "muon co dong luc",
      "truyen cam hung",
      "hy vong",
      "lac quan",
      "vuot qua kho khan",
      "vuot kho",
      "y nghia tich cuc",
      "inspired",
      "need motivation",
    ],
    genres: ["Phiêu lưu", "Hoạt hình", "Gia đình", "Hành động"],
    contentTerms: [
      "hanh trinh",
      "vuot qua",
      "bat dau",
      "bao ve",
      "uoc mo",
      "tinh ban",
      "tuong lai",
    ],
    reason: "hành trình tích cực về hy vọng và vượt qua thử thách",
  },
  {
    name: "muốn thư giãn, nhẹ nhàng",
    terms: [
      "thu gian",
      "nhe nhang",
      "chill",
      "de ngu",
      "khong muon suy nghi",
      "xem gi cho thoai mai",
      "binh yen",
      "relax",
      "calm",
      "peaceful",
    ],
    genres: ["Hoạt hình", "Gia đình", "Tình cảm"],
    contentTerms: [
      "ven bien",
      "mau sac",
      "cham soc",
      "tinh ban",
      "gia dinh",
      "cuoc song moi",
    ],
    reason: "không khí nhẹ nhàng, dễ xem để thư giãn",
  },
  {
    name: "muốn bí ẩn, khám phá",
    terms: [
      "to mo",
      "bi an",
      "pha an",
      "giai ma",
      "kham pha",
      "bat ngo",
      "hack nao",
      "curious",
      "mind bending",
    ],
    genres: ["Bí ẩn", "Tội phạm", "Khoa học viễn tưởng", "Phiêu lưu"],
    contentTerms: [
      "bi mat",
      "kham pha",
      "hanh trinh",
      "the gioi",
      "so phan",
      "bat ngo",
    ],
    reason: "nội dung gợi tò mò và khám phá",
  },
  {
    name: "muốn sợ hãi, rùng rợn",
    terms: [
      "so hai",
      "run ray",
      "rung ron",
      "kinh di",
      "phim ma",
      "muon so",
      "scary",
      "horror",
    ],
    genres: ["Kinh dị"],
    contentTerms: ["ma", "dang so", "kinh hoang", "bi an"],
    reason: "không khí kinh dị, rùng rợn",
  },
];

export function normalizeAssistantText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi");
}

function movieFacts(movie) {
  const knownFacts = KNOWN_MOVIE_FACTS.get(
    normalizeAssistantText(movie.title),
  );
  const genres = [
    ...new Set([
      ...String(movie.genre ?? "")
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean),
      ...(knownFacts?.genres ?? []),
    ]),
  ];
  const runtimeMinutes =
    knownFacts?.runtimeMinutes ??
    (Number.isInteger(Number(movie.runtimeMinutes)) &&
    Number(movie.runtimeMinutes) > 0
      ? Number(movie.runtimeMinutes)
      : null);

  return { ...movie, genres, runtimeMinutes };
}

function requestedGenres(query) {
  return GENRE_TERMS.filter((item) =>
    item.terms.some((term) => query.includes(term)),
  ).map((item) => item.genre);
}

function requestedMoods(query) {
  return MOOD_RULES.filter((mood) =>
    mood.terms.some((term) =>
      new RegExp(
        `(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`,
      ).test(query),
    ),
  );
}

function requestedRuntimeMinutes(query) {
  const hours = query.match(/(\d+(?:[.,]\d+)?)\s*(?:gio|tieng|hours?|h)\b/);
  const minutes = query.match(/(\d+)\s*(?:phut|minutes?|mins?)\b/);
  const total =
    (hours ? Number(hours[1].replace(",", ".")) * 60 : 0) +
    (minutes ? Number(minutes[1]) : 0);
  return total > 0 ? total : null;
}

function recommendationFilters(query) {
  const runtimeMinutes = requestedRuntimeMinutes(query);
  const yearRange = query.match(
    /(?:tu|from)\s+(19\d{2}|20\d{2})\s+(?:den|toi|through|to)\s+(19\d{2}|20\d{2})/,
  );
  const yearAfter = query.match(/(?:sau|after)\s+(19\d{2}|20\d{2})/);
  const yearBefore = query.match(/(?:truoc|before)\s+(19\d{2}|20\d{2})/);
  const exactYear = query.match(
    /(?:phim\s+nam|nam|ra mat nam)\s+(19\d{2}|20\d{2})/,
  );
  const rating = query.match(
    /(?:imdb|diem|rating)\s*(?:tu|tren|it nhat|at least|above|over|>=|>)?\s*([0-9](?:[.,][0-9])?)/,
  );
  const runtimeMaximum =
    runtimeMinutes &&
    /(?:duoi|toi da|khong qua|at most|under|less than)/.test(query)
      ? runtimeMinutes
      : null;
  const runtimeMinimum =
    runtimeMinutes &&
    /(?:it nhat|tu|tren|toi thieu|at least|over|more than)/.test(query)
      ? runtimeMinutes
      : null;

  return {
    runtimeMinutes,
    runtimeMaximum,
    runtimeMinimum,
    yearFrom: yearRange
      ? Number(yearRange[1])
      : yearAfter
        ? Number(yearAfter[1]) + 1
        : exactYear
          ? Number(exactYear[1])
          : null,
    yearTo: yearRange
      ? Number(yearRange[2])
      : yearBefore
        ? Number(yearBefore[1]) - 1
        : exactYear
          ? Number(exactYear[1])
          : null,
    minimumRating: rating ? Number(rating[1].replace(",", ".")) : null,
  };
}

export function hasMovieRecommendationIntent(question) {
  const query = normalizeAssistantText(question);
  return (
    requestedGenres(query).length > 0 ||
    requestedMoods(query).length > 0 ||
    requestedRuntimeMinutes(query) !== null ||
    recommendationFilters(query).yearFrom !== null ||
    recommendationFilters(query).minimumRating !== null ||
    /(goi y|tu van|phim nao|muon xem)/.test(query)
  );
}

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) {
    return `${hours} giờ ${remainingMinutes} phút`;
  }
  if (hours) return `${hours} giờ`;
  return `${remainingMinutes} phút`;
}

export function answerFromCatalog(question, catalog) {
  const query = normalizeAssistantText(question);
  const genres = requestedGenres(query);
  const moods = requestedMoods(query);
  const filters = recommendationFilters(query);

  if (/(xin chao|chao ban|hello|hi\b)/.test(query)) {
    return "Chào bạn! Hãy cho mình biết thể loại phim hoặc thời lượng bạn muốn xem, mình sẽ tìm phim phù hợp trong kho MovieVerse.";
  }

  const movies = catalog
    .map(movieFacts)
    .map((movie) => ({
      ...movie,
      matchingGenres: movie.genres.filter((genre) => genres.includes(genre)),
      matchingMoods: moods.filter((mood) => {
        const movieText = normalizeAssistantText(
          `${movie.title} ${movie.description} ${movie.genres.join(" ")}`,
        );
        return (
          mood.genres.some((genre) => movie.genres.includes(genre)) ||
          mood.contentTerms.some((term) => movieText.includes(term))
        );
      }),
    }));
  const requestedMovies = movies.filter((movie) => {
    const year = Number(movie.year);
    const rating = Number(movie.rating);
    if (genres.length && !movie.matchingGenres.length) return false;
    if (moods.length && !genres.length && !movie.matchingMoods.length) {
      return false;
    }
    if (filters.yearFrom !== null && year < filters.yearFrom) return false;
    if (filters.yearTo !== null && year > filters.yearTo) return false;
    if (
      filters.minimumRating !== null &&
      (!Number.isFinite(rating) || rating < filters.minimumRating)
    ) {
      return false;
    }
    if (
      (filters.runtimeMaximum !== null ||
        filters.runtimeMinimum !== null) &&
      movie.runtimeMinutes === null
    ) {
      return false;
    }
    if (
      filters.runtimeMaximum !== null &&
      movie.runtimeMinutes > filters.runtimeMaximum
    ) {
      return false;
    }
    if (
      filters.runtimeMinimum !== null &&
      movie.runtimeMinutes < filters.runtimeMinimum
    ) {
      return false;
    }
    return true;
  });
  if (!requestedMovies.length) {
    return "Mình chưa tìm thấy phim nào khớp tất cả tiêu chí trong kho. Bạn thử nới lỏng thể loại, thời lượng, năm phát hành hoặc điểm IMDb nhé.";
  }

  requestedMovies.sort((first, second) => {
    const genreDifference =
      second.matchingGenres.length - first.matchingGenres.length;
    if (genreDifference) return genreDifference;

    const moodDifference =
      second.matchingMoods.length - first.matchingMoods.length;
    if (moodDifference) return moodDifference;

    if (
      filters.runtimeMinutes &&
      filters.runtimeMaximum === null &&
      filters.runtimeMinimum === null
    ) {
      const firstDistance = first.runtimeMinutes
        ? Math.abs(first.runtimeMinutes - filters.runtimeMinutes)
        : null;
      const secondDistance = second.runtimeMinutes
        ? Math.abs(second.runtimeMinutes - filters.runtimeMinutes)
        : null;
      if (firstDistance !== null && secondDistance === null) return -1;
      if (firstDistance === null && secondDistance !== null) return 1;
      if (
        firstDistance !== null &&
        secondDistance !== null &&
        firstDistance !== secondDistance
      ) {
        return firstDistance - secondDistance;
      }
    }

    return Number(second.rating) - Number(first.rating);
  });

  const movie = requestedMovies[0];

  const details = [];
  if (movie.runtimeMinutes) {
    details.push(`dài ${formatRuntime(movie.runtimeMinutes)}`);
  }
  if (movie.genres.length) {
    details.push(
      `thuộc thể loại ${movie.genres.join(", ").toLocaleLowerCase("vi")}`,
    );
  }
  if (movie.matchingMoods.length) {
    const mood = movie.matchingMoods[0];
    details.push(`hợp với tâm trạng của bạn: ${mood.reason}`);
  }
  if (Number.isFinite(Number(movie.year))) {
    details.push(`ra mắt năm ${movie.year}`);
  }
  if (Number.isFinite(Number(movie.rating))) {
    details.push(`điểm IMDb ${Number(movie.rating).toFixed(1)}/10`);
  }
  if (!details.length && movie.description) {
    details.push(movie.description);
  }

  return `Bạn có thể xem ${movie.title}.${details.length ? ` Phim ${details.join(", ")}.` : ""}`;
}
