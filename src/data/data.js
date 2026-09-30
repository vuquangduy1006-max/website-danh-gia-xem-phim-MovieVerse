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
      "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Paul Atreides hợp nhất với Chani và người Fremen trong hành trình trả thù những kẻ đã hủy diệt gia đình mình.",
  },
  {
    id: "m2",
    title: "The Last Horizon",
    year: "2024",
    genre: "Hành động",
    rating: "8.5",
    isNew: false,
    poster:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85",
    description:
      "Một phi hành đoàn đơn độc phải vượt qua rìa của vũ trụ để mang hy vọng cuối cùng trở về Trái Đất.",
  },
  {
    id: "m3",
    title: "Past Lives",
    year: "2023",
    genre: "Tâm lý",
    rating: "8.1",
    isNew: false,
    poster:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=85",
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
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
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
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Một nhóm phóng viên chạy đua với thời gian để ghi lại khoảnh khắc lịch sử của một đất nước.",
  },
  {
    id: "m6",
    title: "The Quiet Room",
    year: "2023",
    genre: "Tâm lý",
    rating: "7.8",
    isNew: false,
    poster:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&q=85",
    description:
      "Một căn phòng im lặng, một bí mật cũ và cuộc đối thoại có thể thay đổi tất cả.",
  },
  {
    id: "m7",
    title: "Neon City",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.0",
    isNew: false,
    poster:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=85",
    description:
      "Thành phố không bao giờ ngủ che giấu những câu chuyện của những người sống dưới ánh đèn neon.",
  },
  {
    id: "m8",
    title: "Wildwood",
    year: "2024",
    genre: "Hoạt hình",
    rating: "7.7",
    isNew: false,
    poster:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85",
    description:
      "Một cô bé bước vào khu rừng kỳ diệu để tìm lại người anh trai mất tích.",
  },
  {
    id: "n1",
    title: "Midnight Signal",
    year: "2024",
    genre: "Bí ẩn",
    rating: "8.4",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1800&q=85",
    description:
      "Một tín hiệu lạ xuất hiện giữa đêm và kéo một kỹ sư trẻ vào bí mật bị chôn vùi nhiều năm.",
  },
  {
    id: "n2",
    title: "Blue Summer",
    year: "2024",
    genre: "Tâm lý",
    rating: "8.0",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1507525422872-b6696d73aee5?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1507525422872-b6696d73aee5?w=1800&q=85",
    description:
      "Một mùa hè ngắn ngủi khiến ba người xa lạ nhìn lại những lựa chọn của mình.",
  },
  {
    id: "n3",
    title: "Rogue Planet",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.6",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1800&q=85",
    description:
      "Phi hành đoàn cuối cùng của nhân loại tìm thấy một hành tinh có thể là ngôi nhà mới.",
  },
  {
    id: "n4",
    title: "Paper Hearts",
    year: "2024",
    genre: "Tâm lý",
    rating: "7.9",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1800&q=85",
    description:
      "Những lá thư chưa gửi kết nối hai thế hệ trong một câu chuyện dịu dàng về gia đình.",
  },
  {
    id: "n5",
    title: "Superman",
    year: "2025",
    genre: "Hành động",
    rating: "7.1",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
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
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=85",
    description:
      "Gia đình siêu anh hùng đối mặt với mối đe dọa có thể định đoạt số phận Trái Đất.",
  },
  {
    id: "n7",
    title: "Zootopia 2",
    year: "2025",
    genre: "Hoạt hình",
    rating: "7.6",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1800&q=85",
    description:
      "Judy Hopps và Nick Wilde tiếp tục phá án trong chuyến phiêu lưu mới tại Zootopia.",
  },
  {
    id: "n8",
    title: "F1",
    year: "2025",
    genre: "Hành động",
    rating: "7.7",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
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
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
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
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
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
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=85",
    description:
      "Deadpool kéo Wolverine vào chuyến phiêu lưu xuyên đa vũ trụ đầy hỗn loạn.",
  },
  {
    id: "n12",
    title: "Moana 2",
    year: "2024",
    genre: "Hoạt hình",
    rating: "7.0",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1507525422872-b6696d73aee5?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1507525422872-b6696d73aee5?w=1800&q=85",
    description:
      "Moana cùng những người bạn lên đường vượt đại dương để kết nối các cộng đồng trên đảo.",
  },
  {
    id: "n13",
    title: "The Wild Robot",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.2",
    isNew: true,
    poster:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
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
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=85",
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
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=85",
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
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
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
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=85",
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
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=1800&q=85",
    description:
      "Một ám ảnh cổ xưa gieo bóng tối lên cuộc sống của một phụ nữ trẻ và những người quanh cô.",
  },
];

const DB_KEY = "movieverse_db";
const SEED_MIGRATION_KEY = "movieverse_seed_migration_v4";
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
]);

export function getMovieDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.movies) && parsed.movies.length) {
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
          const existingIds = new Set(parsed.movies.map((movie) => movie.id));
          const additions = movieSeed.filter(
            (movie) =>
              addedSeedMovieIds.has(movie.id) && !existingIds.has(movie.id),
          );
          if (additions.length) {
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
