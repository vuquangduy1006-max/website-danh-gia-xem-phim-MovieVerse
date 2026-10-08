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
  {
    genre: "Kinh dị",
    terms: ["kinh di", "phim ma", "horror", "scary movie"],
  },
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
      "chan nan",
      "thay minh vo dung",
      "bi bo lai",
      "moi chia tay",
      "cai nhau voi ban",
      "mau thuan voi nguoi than",
      "bi phan boi",
      "tim nang triu",
      "khong vui",
      "tui than",
      "muon khoc",
      "can mot bo phim buon",
      "chia tay",
      "that tinh",
      "moi bi tu choi",
      "bi tu choi",
      "khong duoc chon",
      "truot phong van",
      "rot phong van",
      "mat viec",
      "vo dung",
      "lac long",
      "long nang triu",
      "khong biet chia se voi ai",
      "no one to talk to",
      "miss someone",
      "mood tut",
      "tam trang tut",
      "chan doi",
      "trong rong",
      "hut hang",
      "bi bo roi",
      "bi ghost",
      "sad day",
      "feeling blue",
      "down in the dumps",
      "miss my ex",
      "feeling rejected",
      "gloomy",
      "empty inside",
      "feeling empty",
      "left out",
      "no one understands me",
      "sad",
      "lonely",
      "heartbroken",
      "feeling down",
      "feeling low",
      "feeling alone",
      "feeling lost",
      "breakup",
      "rejected",
    ],
    genres: ["Tâm lý", "Tình cảm", "Chính kịch"],
    goalTerms: ["phim buon", "cau chuyen buon", "muon khoc", "can khoc"],
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
      "khong on chut nao",
      "khong on lam",
      "chan nan",
      "that vong",
      "ap luc",
      "met moi",
      "kiet suc",
      "het nang luong",
      "tinh than xuong",
      "dau oc met",
      "muon nghi ngoi",
      "stress",
      "cang thang",
      "ngay met moi",
      "ngay dai",
      "ngay toi te",
      "ngay hom nay te",
      "ngay hom nay dung la te hai",
      "te hai",
      "hom nay te qua",
      "can mot cai om",
      "can duoc vo ve",
      "vo ve tinh than",
      "muon ai do an ui",
      "thay on hon",
      "muon co nguoi lang nghe",
      "qua tai",
      "het pin",
      "can xa hoi",
      "muon o mot minh",
      "muon tam dung",
      "burnt out",
      "stressful day",
      "lo lang",
      "bat an",
      "muon duoc an ui",
      "can duoc dong vien",
      "muon vui len",
      "chua lanh",
      "pick me up",
      "cheer me up",
      "comfort",
      "stressed",
      "overwhelmed",
      "rough day",
      "rough week",
      "bad day",
      "bad mood",
      "just need a hug",
      "need a hug",
    ],
    genres: ["Hoạt hình", "Gia đình", "Hài", "Tình cảm"],
    goalTerms: [
      "an ui",
      "vo ve",
      "binh tam",
      "nhe long",
      "de chiu",
      "am ap",
      "feel good",
      "uplifting",
    ],
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
    name: "đang tức giận, muốn xả năng lượng",
    terms: [
      "tuc gian",
      "tuc toi",
      "tuc dien",
      "buc tuc",
      "buc minh",
      "cay",
      "cay cu",
      "cuc qua",
      "cay cu",
      "bi choi xau",
      "dong nghiep choi xau",
      "bi lua",
      "vua bi mang",
      "muon xa gian",
      "xa stress",
      "muon dap pha",
      "muon xa cang thang",
      "angry",
      "furious",
      "frustrated",
    ],
    genres: ["Hành động", "Tội phạm", "Phiêu lưu"],
    goalTerms: [
      "xa gian",
      "xa stress",
      "xa nang luong",
      "manh me",
      "hanh dong",
      "phim cuon",
    ],
    contentTerms: [
      "chay dua",
      "duong dua",
      "doi dau",
      "chien dau",
      "bao ve",
      "tra thu",
      "dau truong",
    ],
    reason: "nhịp phim mạnh mẽ để giải tỏa năng lượng",
  },
  {
    name: "đang lo lắng, muốn bình tâm",
    terms: [
      "hoi hop vi",
      "lo ngay mai",
      "lo cho ky thi",
      "sap thi",
      "mai thi",
      "so phong van",
      "lo phong van",
      "bat an",
      "cuon len",
      "ap luc thi cu",
      "sap den han",
      "deadline",
      "so truot",
      "khong ngu duoc vi lo",
      "anxious",
      "nervous",
      "worried",
    ],
    genres: ["Hoạt hình", "Gia đình", "Tình cảm"],
    goalTerms: [
      "binh yen",
      "binh tam",
      "nhe nhang",
      "thu gian",
      "de ngu",
      "calm",
      "relax",
    ],
    contentTerms: [
      "am ap",
      "ven bien",
      "mau sac",
      "cham soc",
      "tinh ban",
      "cuoc song moi",
    ],
    reason: "không khí nhẹ nhàng để bạn bình tâm và thư giãn",
  },
  {
    name: "đang vui, muốn ăn mừng",
    terms: [
      "vua dat duoc",
      "vua tot nghiep",
      "thi dau xong",
      "vua thi xong",
      "vua nop xong",
      "xong deadline",
      "duoc thang chuc",
      "duoc nhan viec",
      "vua ket hon",
      "hom nay sinh nhat",
      "muon an mung",
      "hom nay la ngay dac biet",
      "cuoi cung cung xong",
      "co tin vui",
      "just got promoted",
      "got the job",
      "celebrating",
    ],
    genres: ["Hài", "Hoạt hình", "Phiêu lưu"],
    goalTerms: ["an mung", "chien thang", "vui", "dat duoc"],
    contentTerms: [
      "hon loan",
      "phieu luu",
      "the gioi ky dieu",
      "mau sac",
      "gia dinh",
    ],
    reason: "không khí vui tươi, hợp để ăn mừng",
  },
  {
    name: "muốn vui vẻ, giải trí",
    terms: [
      "muon cuoi",
      "can tieng cuoi",
      "cuoi dau bung",
      "cuoi muon xiu",
      "cuoi that nhieu",
      "muon doi mood",
      "muon doi gio",
      "xem gi cho vui",
      "vui ve",
      "vui",
      "chan qua",
      "chan muon chet",
      "buon chan",
      "phan khoi",
      "hao hung",
      "hanh phuc",
      "phan khoi",
      "giai tri",
      "hai huoc",
      "tam trang vui",
      "dang vui",
      "tinh than len cao",
      "cheerful",
      "bored",
      "funny",
      "laugh",
      "need a laugh",
    ],
    genres: ["Hài", "Hoạt hình"],
    goalTerms: [
      "cuoi",
      "vui",
      "hai",
      "giai tri",
      "feel good",
      "phim vui",
    ],
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
      "muon mot bo phim cuon",
      "phim cuon",
      "xoan nao",
      "plot twist",
      "thrilling",
      "suspense",
      "edge of my seat",
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
      "hen ho",
      "crush",
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
      "cam thay vo dung",
      "khong con dong luc",
      "khong thay loi thoat",
      "khong biet lam gi tiep",
      "muon co dong luc",
      "truyen cam hung",
      "hy vong",
      "lac quan",
      "vuot qua kho khan",
      "vuot kho",
      "be tac",
      "mat phuong huong",
      "mat dong luc",
      "can tiep dong luc",
      "khong muon bo cuoc",
      "co gang tiep",
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
      "dau oc roi boi",
      "chi muon yen tinh",
      "dau oc met moi",
      "tron khoi thuc tai",
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
      "plot twist",
      "doan xem chuyen gi xay ra",
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
    item.terms.some((term) => matchesRequestedTerm(query, term)),
  ).map((item) => item.genre);
}

function matchesRequestedTerm(query, term) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedTerm}($|[^a-z0-9])`,
    "g",
  );

  for (const match of query.matchAll(pattern)) {
    const clause = query
      .slice(0, match.index)
      .split(/[,;.!?]|\b(?:nhung|but|however)\b/)
      .at(-1);
    if (
      !/(?:^|\s)(?:khong|dung|tranh|not|dont|never)(?:\s+\w+){0,5}\s*$/.test(
        clause,
      )
    ) {
      return true;
    }
  }

  return false;
}

function requestedMoods(query) {
  return MOOD_RULES.filter((mood) =>
    mood.terms.some((term) => matchesRequestedTerm(query, term)),
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
  const targetMoods = moods.filter((mood) =>
    (mood.goalTerms ?? []).some((term) =>
      matchesRequestedTerm(query, term),
    ),
  );
  const filters = recommendationFilters(query);

  if (/(xin chao|chao ban|hello|\bhi\b)/.test(query)) {
    return "Chào bạn! Hãy cho mình biết thể loại phim hoặc thời lượng bạn muốn xem, mình sẽ tìm phim phù hợp trong kho MovieVerse.";
  }

  const movies = catalog
    .map(movieFacts)
    .map((movie) => ({
      ...movie,
      matchingGenres: movie.genres.filter((genre) => genres.includes(genre)),
      matchingMoods: moods
        .map((mood) => {
          const movieText = normalizeAssistantText(
            `${movie.title} ${movie.description} ${movie.genres.join(" ")}`,
          );
          const contentMatchCount = mood.contentTerms.filter((term) =>
            movieText.includes(term),
          ).length;
          const genreMatch = mood.genres.some((genre) =>
            movie.genres.includes(genre),
          );
          const goalMatch = (mood.goalTerms ?? []).some((term) =>
            matchesRequestedTerm(query, term),
          );
          const relevanceScore = contentMatchCount
            ? 2 + contentMatchCount + Number(genreMatch)
            : genreMatch
              ? 0.25
              : 0;
          return {
            mood,
            relevanceScore,
            score: relevanceScore + Number(goalMatch) * 8,
          };
        })
        .filter((match) => match.relevanceScore > 0)
        .sort((first, second) => second.score - first.score),
      moodScore: 0,
    }));
  for (const movie of movies) {
    movie.moodScore = movie.matchingMoods.reduce(
      (total, match) => total + match.score,
      0,
    );
  }
  const requestedMovies = movies.filter((movie) => {
    const year = Number(movie.year);
    const rating = Number(movie.rating);
    if (genres.length && !movie.matchingGenres.length) return false;
    if (
      targetMoods.length &&
      !movie.matchingMoods.some((match) => targetMoods.includes(match.mood))
    ) {
      return false;
    }
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
    if (genres.length) {
      const genreDifference =
        second.matchingGenres.length - first.matchingGenres.length;
      if (genreDifference) return genreDifference;
    }

    const moodDifference = second.moodScore - first.moodScore;
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
    const mood = movie.matchingMoods[0].mood;
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
