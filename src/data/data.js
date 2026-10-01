export const genreList = [
  "Hành động",
  "Phiêu lưu",
  "Hài",
  "Chính kịch",
  "Tình cảm",
  "Kinh dị",
  "Tội phạm",
  "Gia đình",
  "Giả tưởng",
  "Khoa học viễn tưởng",
  "Lịch sử",
  "Tài liệu",
  "Âm nhạc",
  "Chiến tranh",
  "Thể thao",
  "Tâm lý",
  "Hoạt hình",
  "Bí ẩn",
  "Tokusatsu",
];

export function getMovieGenres(movie) {
  const genres = Array.isArray(movie?.genre)
    ? movie.genre
    : String(movie?.genre ?? "").split(",");
  return genres.map((genre) => String(genre).trim()).filter(Boolean);
}

export const movieSeed = [
  {
    id: "m1",
    title: "Dune: Part Two",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.8",
    isNew: false,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Dune%20Part%20Two%20poster.jpeg",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Paul Atreides hợp nhất với Chani và người Fremen trong hành trình trả thù những kẻ đã hủy diệt gia đình mình.",
  },
  {
    id: "m3",
    title: "Past Lives",
    year: "2023",
    genre: "Tâm lý",
    rating: "8.1",
    isNew: false,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Past%20Lives%20film%20poster.png",
    backdrop:
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=1800&q=85",
    description:
      "Hai người bạn thời thơ ấu gặp lại nhau sau nhiều năm, đối diện với những điều chưa từng nói.",
  },
  {
    id: "m4",
    title: "Kiki’s Delivery",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.3",
    isNew: false,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Kiki%27s%20Delivery%20Service%20%28Movie%29.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=85",
    description:
      "Một cô phù thủy trẻ bắt đầu cuộc sống mới trong thành phố ven biển đầy màu sắc.",
  },
  {
    id: "m5",
    title: "Civil War",
    year: "2024",
    genre: "Hành động",
    rating: "7.9",
    isNew: false,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Civil%20War%202024%20film%20poster.jpeg",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Một nhóm phóng viên chạy đua với thời gian để ghi lại khoảnh khắc lịch sử của một đất nước.",
  },
  {
    id: "m8",
    title: "Wildwood",
    year: "2024",
    genre: "Hoạt hình",
    rating: "7.7",
    isNew: false,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Wildwood%202026%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85",
    description:
      "Một cô bé bước vào khu rừng kỳ diệu để tìm lại người anh trai mất tích.",
  },
  {
    id: "n5",
    title: "Superman",
    year: "2025",
    genre: "Hành động",
    rating: "7.1",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Superman%20%282025%20film%29%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Clark Kent tìm cách cân bằng nguồn gốc Krypton với cuộc sống của mình tại Metropolis.",
  },
  {
    id: "n6",
    title: "The Fantastic Four: First Steps",
    year: "2025",
    genre: "Khoa học viễn tưởng",
    rating: "7.3",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/The%20Fantastic%20Four%20First%20Steps%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=85",
    description:
      "Gia đình siêu anh hùng đối mặt với mối đe dọa có thể định đoạt số phận Trái Đất.",
  },
  {
    id: "n8",
    title: "F1",
    year: "2025",
    genre: "Hành động",
    rating: "7.7",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/F1%20%282025%20film%29.png",
    backdrop:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85",
    description:
      "Một tay đua kỳ cựu trở lại đường đua Công thức 1 để dẫn dắt thế hệ tay đua tiếp theo.",
  },
  {
    id: "n9",
    title: "Gladiator II",
    year: "2024",
    genre: "Hành động",
    rating: "7.0",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Gladiator%20II%20%282024%29%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Lucius bước vào đấu trường Colosseum để đối mặt với quyền lực và di sản của đế chế La Mã.",
  },
  {
    id: "n10",
    title: "Inside Out 2",
    year: "2024",
    genre: "Hoạt hình",
    rating: "7.6",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Inside%20Out%202%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=85",
    description:
      "Riley bước vào tuổi mới lớn khi những cảm xúc mới bất ngờ xuất hiện trong trung tâm điều khiển.",
  },
  {
    id: "n11",
    title: "Deadpool & Wolverine",
    year: "2024",
    genre: "Hành động",
    rating: "7.5",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Deadpool%20%26%20Wolverine%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=85",
    description:
      "Deadpool kéo Wolverine vào chuyến phiêu lưu xuyên đa vũ trụ đầy hỗn loạn.",
  },
  {
    id: "n13",
    title: "The Wild Robot",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.2",
    isNew: true,
    poster:
      "https://upload.wikimedia.org/wikipedia/en/7/70/The_Wild_Robot_poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85",
    description:
      "Robot Roz học cách sinh tồn và chăm sóc một chú ngỗng con trên hòn đảo hoang.",
  },
  {
    id: "n14",
    title: "Wicked",
    year: "2024",
    genre: "Tâm lý",
    rating: "7.4",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Wicked%20%282024%20film%29%20poster.png",
    backdrop:
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=1800&q=85",
    description:
      "Hai cô gái với tính cách trái ngược hình thành tình bạn trước khi số phận đưa họ về hai phía.",
  },
  {
    id: "n15",
    title: "A Minecraft Movie",
    year: "2025",
    genre: "Hoạt hình",
    rating: "5.6",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/A%20Minecraft%20Movie%20poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85",
    description:
      "Bốn người bạn bất ngờ bị cuốn vào thế giới khối vuông và phải tìm đường trở về nhà.",
  },
  {
    id: "n16",
    title: "How to Train Your Dragon",
    year: "2025",
    genre: "Hoạt hình",
    rating: "7.8",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/How%20To%20Train%20Your%20Dragon%202025%20Poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Hiccup và Toothless xây dựng tình bạn vượt qua nỗi sợ hãi giữa người Viking và loài rồng.",
  },
  {
    id: "n17",
    title: "Mission: Impossible - The Final Reckoning",
    year: "2025",
    genre: "Hành động",
    rating: "7.2",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Mission%20Impossible%20%E2%80%93%20The%20Final%20Reckoning%20Poster.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85",
    description:
      "Ethan Hunt chạy đua với thời gian để ngăn một mối đe dọa công nghệ toàn cầu.",
  },
  {
    id: "n18",
    title: "Nosferatu",
    year: "2024",
    genre: "Bí ẩn",
    rating: "7.1",
    isNew: true,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Nosferatu%20IMAX%20poster%202024.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=1800&q=85",
    description:
      "Một ám ảnh cổ xưa gieo bóng tối lên cuộc sống của một phụ nữ trẻ và những người quanh cô.",
  },
  {
    id: "n19",
    title: "Kamen Rider Build",
    year: "2017",
    genre:
      "Hành động, Phiêu lưu, Hài, Chính kịch, Tình cảm, Giả tưởng, Khoa học viễn tưởng, Hoạt hình, Tokusatsu",
    rating: "8.5",
    isNew: true,
    poster: "https://i.redd.it/96mkpqpb9wsa1.jpg",
    backdrop: "https://i.redd.it/96mkpqpb9wsa1.jpg",
    description:
      "Nhà vật lý thiên tài Sento Kiryu biến thân thành Kamen Rider Build, chiến đấu chống lại Smash và khám phá bí mật của chiếc hộp Pandora.",
  },
];

const DB_KEY = "movieverse_db";
const SEED_MIGRATION_KEY = "movieverse_seed_migration_v9";
const addedSeedMovieIds = new Set([
  "n5",
  "n6",
  "n7",
  "n8",
  "n9",
  "n10",
  "n11",
  "n12",
  "n13",
  "n14",
  "n15",
  "n16",
  "n17",
  "n18",
  "n19",
]);
const removedSeedMovieIds = new Set([
  "m2",
  "m6",
  "m7",
  "n1",
  "n2",
  "n3",
  "n4",
  "n7",
  "n12",
]);
const removedMovieTitles = new Set(
  [
    "The Last Horizon",
    "The Quiet Room",
    "Neon City",
    "Midnight Signal",
    "Blue Summer",
    "Rogue Planet",
    "Paper Hearts",
    "Zootopia 2",
    "Moana 2",
  ].map((title) => title.toLocaleLowerCase("vi")),
);

export function getMovieDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.movies) && parsed.movies.length) {
        const cleanedMovies = parsed.movies.filter(
          (movie) =>
            !removedSeedMovieIds.has(movie.id) &&
            !removedMovieTitles.has(
              String(movie.title ?? "")
                .trim()
                .toLocaleLowerCase("vi"),
            ),
        );
        if (cleanedMovies.length !== parsed.movies.length) {
          saveMovieDB(cleanedMovies);
        }
        parsed.movies = cleanedMovies;
        if (localStorage.getItem("movieverse_seed_migration_v2") === "done") {
          const addedTitles = new Map([
            ["n5", "Oppenheimer"],
            ["n6", "Spider-Man: Across the Spider-Verse"],
            ["n7", "The Batman"],
            ["n8", "Interstellar"],
          ]);
          const cleanedMovies = parsed.movies.filter(
            (movie) => addedTitles.get(movie.id) !== movie.title,
          );
          if (cleanedMovies.length !== parsed.movies.length) {
            saveMovieDB(cleanedMovies);
          }
          parsed.movies = cleanedMovies;
          localStorage.removeItem("movieverse_seed_migration_v2");
        }
        if (localStorage.getItem(SEED_MIGRATION_KEY) !== "done") {
          const posterMigrations = new Map([
            [
              "n11",
              [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Deadpool%20%26%20Wolverine%20poster.jpg",
              ],
            ],
            [
              "n14",
              [
                "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Wicked%20%282024%20film%29%20poster.png",
              ],
            ],
            [
              "n15",
              [
                "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/A%20Minecraft%20Movie%20poster.jpg",
              ],
            ],
            [
              "n16",
              [
                "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/How%20To%20Train%20Your%20Dragon%202025%20Poster.jpg",
              ],
            ],
            [
              "n17",
              [
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Mission%20Impossible%20%E2%80%93%20The%20Final%20Reckoning%20Poster.jpg",
              ],
            ],
            [
              "n18",
              [
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Nosferatu%20IMAX%20poster%202024.jpg",
              ],
            ],
            [
              "n5",
              [
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Superman%20%282025%20film%29%20poster.jpg",
              ],
            ],
            [
              "n6",
              [
                "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/The%20Fantastic%20Four%20First%20Steps%20poster.jpg",
              ],
            ],
            [
              "n8",
              [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/F1%20%282025%20film%29.png",
              ],
            ],
            [
              "n9",
              [
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Gladiator%20II%20%282024%29%20poster.jpg",
              ],
            ],
            [
              "n10",
              [
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Inside%20Out%202%20poster.jpg",
              ],
            ],
            [
              "m1",
              [
                "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Dune%20Part%20Two%20poster.jpeg",
              ],
            ],
            [
              "m3",
              [
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Past%20Lives%20film%20poster.png",
              ],
            ],
            [
              "m4",
              [
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Kiki%27s%20Delivery%20Service%20%28Movie%29.jpg",
              ],
            ],
            [
              "m5",
              [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Civil%20War%202024%20film%20poster.jpeg",
              ],
            ],
            [
              "m8",
              [
                "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
                "https://en.wikipedia.org/wiki/Special:FilePath/Wildwood%202026%20poster.jpg",
              ],
            ],
            [
              "n7",
              [
                "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
                "https://upload.wikimedia.org/wikipedia/en/6/6a/Zootopia_2_%282025_film%29.jpg",
              ],
            ],
            [
              "n13",
              [
                "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
                "https://upload.wikimedia.org/wikipedia/en/7/70/The_Wild_Robot_poster.jpg",
              ],
            ],
          ]);
          let postersUpdated = false;
          parsed.movies.forEach((movie) => {
            const [previousPoster, nextPoster] =
              posterMigrations.get(movie.id) ?? [];
            if (movie.poster === previousPoster) {
              movie.poster = nextPoster;
              postersUpdated = true;
            }
          });

          const existingIds = new Set(parsed.movies.map((movie) => movie.id));
          const existingTitles = new Set(
            parsed.movies.map((movie) =>
              movie.title.trim().toLocaleLowerCase("vi"),
            ),
          );
          const additions = movieSeed.filter(
            (movie) =>
              addedSeedMovieIds.has(movie.id) &&
              !existingIds.has(movie.id) &&
              !existingTitles.has(movie.title.trim().toLocaleLowerCase("vi")),
          );
          if (additions.length || postersUpdated) {
            parsed.movies.push(...additions);
            saveMovieDB(parsed.movies);
          }
          localStorage.setItem(SEED_MIGRATION_KEY, "done");
        }
        return parsed.movies;
      }
    }
  } catch (_) {}
  return movieSeed;
}

export function saveMovieDB(movies) {
  localStorage.setItem(DB_KEY, JSON.stringify({ movies }));
}
