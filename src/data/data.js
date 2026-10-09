const godvalleyPoster = new URL(
  "../assets/poster/godvalley.png",
  import.meta.url,
).href;
const spyPoster = new URL("../assets/poster/spy.png", import.meta.url).href;
const dragonballzPoster = new URL(
  "../assets/poster/dragonballz.png",
  import.meta.url,
).href;
const bleachPoster = new URL("../assets/poster/bleach.png", import.meta.url)
  .href;
const fullmetalPoster = new URL(
  "../assets/poster/fullmetal.png",
  import.meta.url,
).href;
const fairytailPoster = new URL(
  "../assets/poster/fairytail100.png",
  import.meta.url,
).href;
const heroAcademiaPoster = new URL(
  "../assets/poster/heroacademia.png",
  import.meta.url,
).href;
const hunterPoster = new URL("../assets/poster/hunter.png", import.meta.url)
  .href;
const blueLockPoster = new URL("../assets/poster/bluelock.png", import.meta.url)
  .href;
const interstellar2Poster = new URL(
  "../assets/poster/interstellar2.png",
  import.meta.url,
).href;
const spidermanPoster = new URL(
  "../assets/poster/spiderman.png",
  import.meta.url,
).href;

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

const GENRE_STORAGE_KEY = "movieverse_genres";

export function getGenreList() {
  try {
    const storedGenres = JSON.parse(
      localStorage.getItem(GENRE_STORAGE_KEY) || "null",
    );
    if (
      Array.isArray(storedGenres) &&
      storedGenres.every((genre) => typeof genre === "string")
    ) {
      return storedGenres;
    }
  } catch (_) {}
  return [...genreList];
}

export function saveGenreList(genres) {
  localStorage.setItem(GENRE_STORAGE_KEY, JSON.stringify(genres));
}

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
    episodeCount: 49,
  },
  {
    id: "n20",
    title: "One Piece Film: God Valley",
    year: "2023",
    genre: "Hành động, Phiêu lưu, Hài, Gia đình, Giả tưởng",
    rating: "8.8",
    isNew: true,
    poster: godvalleyPoster,
    backdrop:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1800&q=85",
    description:
      "Trailer fan-made về biến cố God Valley trong thế giới One Piece; nội dung video không phải trailer chính thức.",
  },
  {
    id: "n21",
    title: "SPY x FAMILY CODE: White",
    year: "2022",
    genre: "Hài, Hành động, Tình cảm, Gia đình, Giả tưởng",
    rating: "8.6",
    isNew: true,
    poster: spyPoster,
    backdrop:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85",
    description:
      "Gia đình Forger bước vào chuyến phiêu lưu mùa đông có thể ảnh hưởng đến chiến dịch Operation Strix.",
  },
  {
    id: "n22",
    title: "Attack on Titan: Season 1",
    year: "2013",
    genre: "Hành động, Chính kịch, Khoa học viễn tưởng, Tâm lý, Chiến tranh",
    rating: "9.1",
    isNew: true,
    poster:
      "https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1518770660439-463ac1d4f9fa?w=1800&q=85",
    description:
      "Eren và bạn bè sống trong thành phố rào chắn khi cuộc chiến chống lại khổng lồ mang đến câu hỏi về tự do, chiến tranh và tiền định.",
    episodeCount: 16,
  },
  {
    id: "n23",
    title: "Naruto: 20th Anniversary",
    year: "2002",
    genre: "Hành động, Phiêu lưu, Hài, Gia đình, Tâm lý",
    rating: "8.7",
    isNew: true,
    poster:
      "https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg",
    backdrop:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1800&q=85",
    description:
      "Naruto bước qua nhiều thử thách để chứng minh bản thân và bảo vệ những người mình yêu thương trong thế giới ninja.",
    episodeCount: 20,
  },
  {
    id: "n24",
    title: "Dragon Ball Z",
    year: "1989",
    genre: "Hành động, Phiêu lưu, Hài, Giả tưởng, Huyền bí",
    rating: "8.9",
    isNew: true,
    poster: dragonballzPoster,
    backdrop:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1800&q=85",
    description:
      "Goku và các chiến binh Z rèn luyện, chiến đấu và bảo vệ Trái Đất trước các thế lực siêu mạnh từ vũ trụ.",
    episodeCount: 18,
  },
  {
    id: "n25",
    title: "Bleach: Thousand-Year Blood War",
    year: "2004",
    genre: "Hành động, Giả tưởng, Hài, Tâm lý, Tokusatsu",
    rating: "8.2",
    isNew: true,
    poster: bleachPoster,
    backdrop:
      "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=1800&q=85",
    description:
      "Ichigo trở thành Soul Reaper và đối đầu với linh hồn, quỷ và những bí mật đen tối của thế giới siêu nhiên.",
    episodeCount: 17,
  },
  {
    id: "n27",
    title: "Fullmetal Alchemist: Brotherhood",
    year: "2009",
    genre: "Hành động, Hài, Phiêu aventure, Giả tưởng, Chính kịch",
    rating: "9.1",
    isNew: true,
    poster: fullmetalPoster,
    backdrop:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85",
    description:
      "Hai anh em Elric đi tìm kiếm phép thuật và sự thật đằng sau sự mất mát trong một thế giới đầy hiểm nguy.",
    episodeCount: 19,
  },
  {
    id: "n29",
    title: "Fairy Tail: Nhiệm vụ 100 năm",
    year: "2024",
    genre: "Hành động, Phiêu lưu, Hài, Giả tưởng, Gia đình",
    rating: "8.3",
    isNew: true,
    poster: fairytailPoster,
    backdrop:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1800&q=85",
    description:
      "Natsu và đồng đội của Guild Fairy Tail trải qua những trận chiến lớn để bảo vệ bạn bè và khôi phục niềm tin.",
    episodeCount: 18,
  },
  {
    id: "n30",
    title: "My Hero Academia: Final Season",
    year: "2016",
    genre: "Hành động, Hài, Siêu anh hùng, Phiêu lưu, Tâm lý",
    rating: "8.5",
    isNew: true,
    poster: heroAcademiaPoster,
    backdrop:
      "https://images.unsplash.com/photo-1521985429101-21bed8b75e47?w=1800&q=85",
    description:
      "Izuku Midoriya bước vào trường Hero Academy để trở thành siêu anh hùng và kiếm chỗ đứng giữa những người mạnh nhất.",
    episodeCount: 16,
  },
  {
    id: "n31",
    title: "Hunter x Hunter: Set 1",
    year: "2011",
    genre: "Hành động, Phiêu lưu, Tâm lý, Hài, Giả tưởng",
    rating: "9.0",
    isNew: true,
    poster: hunterPoster,
    backdrop:
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1800&q=85",
    description:
      "Gon cống hiến cả cuộc đời để tìm cha mình và vượt qua những thử thách khó nhằn trên hành trình trở thành Hunter.",
    episodeCount: 20,
  },
  {
    id: "n32",
    title: "Blue Lock vs. U-20 Japan",
    year: "2022",
    genre: "Thể thao, Hành động, Tâm lý, Chiến tranh",
    rating: "8.3",
    isNew: true,
    poster: blueLockPoster,
    backdrop:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1800&q=85",
    description:
      "Những cầu thủ trẻ tranh nhau trong khuôn khổ Blue Lock để biến thành tiền đạo hàng đầu của đội tuyển quốc gia.",
    episodeCount: 12,
  },
  {

    id: "kr-kuuga",
    title: "Kamen Rider Kuuga",
    year: "2000",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "8.3",
    imdbId: "tt0188340",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BYWY1ZWViOTQtYmYzNS00YmY0LTk1OTItODkzMjg1ODNiMWZkXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BYWY1ZWViOTQtYmYzNS00YmY0LTk1OTItODkzMjg1ODNiMWZkXkEyXkFqcGc@._V1_.jpg",
    description:
      "Yusuke Godai hóa thân thành Kuuga để bảo vệ con người trước bộ tộc Gurongi cổ đại.",
    episodeCount: 49,
  },
  {
    id: "kr-agito",
    title: "Kamen Rider Agito",
    year: "2001",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "8.0",
    imdbId: "tt0346311",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNjY2YmE0NmUtZjFjZC00NzgyLThkYzEtZDg4ZTUwNjJhZjFkXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNjY2YmE0NmUtZjFjZC00NzgyLThkYzEtZDg4ZTUwNjJhZjFkXkEyXkFqcGc@._V1_.jpg",
    description:
      "Một người mất trí nhớ thức tỉnh sức mạnh Agito giữa những vụ án bí ẩn và cuộc chiến với Unknown.",
    episodeCount: 51,
  },
  {
    id: "kr-ryuki",
    title: "Kamen Rider Ryuki",
    year: "2002",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "8.0",
    imdbId: "tt0419343",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNWU5OGEyMmQtZWY5Yi00YzEwLTg3ZWMtNDNjODdhOTRkZTlmXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNWU5OGEyMmQtZWY5Yi00YzEwLTg3ZWMtNDNjODdhOTRkZTlmXkEyXkFqcGc@._V1_.jpg",
    description:
      "Shinji Kido trở thành Ryuki và bị cuốn vào cuộc chiến sinh tử giữa các Rider trong thế giới gương.",
    episodeCount: 50,
  },
  {
    id: "kr-faiz",
    title: "Kamen Rider 555 (Faiz)",
    year: "2003",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "8.3",
    imdbId: "tt0401021",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BZGYzN2U4ZGQtOGUxYS00MzYzLTgwYjctOTUzYzg5MWQ1ZjgzXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BZGYzN2U4ZGQtOGUxYS00MzYzLTgwYjctOTUzYzg5MWQ1ZjgzXkEyXkFqcGc@._V1_.jpg",
    description:
      "Takumi Inui sử dụng thiết bị Faiz để chống lại Orphnoch và khám phá ranh giới giữa con người với quái vật.",
    episodeCount: 50,
  },
  {
    id: "kr-blade",
    title: "Kamen Rider Blade",
    year: "2004",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.8",
    imdbId: "tt1491939",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BN2IwOTA4MWQtMmI2Ni00ODAxLWExYmItOWNkNzkxYTY1N2QxXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BN2IwOTA4MWQtMmI2Ni00ODAxLWExYmItOWNkNzkxYTY1N2QxXkEyXkFqcGc@._V1_.jpg",
    description:
      "Kazuma Kenzaki chiến đấu với Undead bằng sức mạnh của Blade trong cuộc chiến định đoạt số phận loài người.",
    episodeCount: 49,
  },
  {
    id: "kr-hibiki",
    title: "Kamen Rider Hibiki",
    year: "2005",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.2",
    imdbId: "tt0454653",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BYWU1YzY1ODMtZTFjOC00ZWE1LTgzZTgtNTgxODBjZDYwNGVmXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BYWU1YzY1ODMtZTFjOC00ZWE1LTgzZTgtNTgxODBjZDYwNGVmXkEyXkFqcGc@._V1_.jpg",
    description:
      "Asumu trưởng thành bên cạnh Hibiki, một Oni chiến đấu với Makamou bằng âm nhạc và võ thuật.",
    episodeCount: 48,
  },
  {
    id: "kr-kabuto",
    title: "Kamen Rider Kabuto",
    year: "2006",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.9",
    imdbId: "tt0875947",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BM2VmMmFiNjItMGUxZC00OTljLWE4NGUtYWQzNGU1ODJmM2JjXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BM2VmMmFiNjItMGUxZC00OTljLWE4NGUtYWQzNGU1ODJmM2JjXkEyXkFqcGc@._V1_.jpg",
    description:
      "Tendo Souji mang giáp Kabuto, đối đầu Worm và chiến đấu với tốc độ Clock Up để bảo vệ Trái Đất.",
    episodeCount: 49,
  },
  {
    id: "kr-den-o",
    title: "Kamen Rider Den-O",
    year: "2007",
    genre: "Hành động, Phiêu lưu, Hài, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.8",
    imdbId: "tt0997404",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BYjcwNmQ3NGEtNGNhOC00NzY4LTllYjQtMWYxZjAwMzQ0ZGIxXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BYjcwNmQ3NGEtNGNhOC00NzY4LTllYjQtMWYxZjAwMzQ0ZGIxXkEyXkFqcGc@._V1_.jpg",
    description:
      "Ryotaro Nogami cùng các Imagin du hành thời gian trên DenLiner để ngăn lịch sử bị thay đổi.",
    episodeCount: 49,
  },
  {
    id: "kr-kiva",
    title: "Kamen Rider Kiva",
    year: "2008",
    genre: "Hành động, Phiêu lưu, Chính kịch, Giả tưởng, Tokusatsu",
    rating: "7.4",
    imdbId: "tt1526067",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BMDBhZDUwZjYtZjNiMi00NTE5LWIxNWEtNWQ0NDI1NDAyMDJjXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BMDBhZDUwZjYtZjNiMi00NTE5LWIxNWEtNWQ0NDI1NDAyMDJjXkEyXkFqcGc@._V1_.jpg",
    description:
      "Wataru Kurenai thừa hưởng sức mạnh Kiva và chiến đấu với Fangire trong hai dòng thời gian đan xen.",
    episodeCount: 48,
  },
  {
    id: "kr-decade",
    title: "Kamen Rider Decade",
    year: "2009",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.0",
    imdbId: "tt1473235",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNzQ5MjY3MjUtZjhlYS00YjEwLWE5M2YtNTRkZDU4ZDc5ODZkXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNzQ5MjY3MjUtZjhlYS00YjEwLWE5M2YtNTRkZDU4ZDc5ODZkXkEyXkFqcGc@._V1_.jpg",
    description:
      "Tsukasa Kadoya đi qua các thế giới Rider để ngăn những thế giới ấy sụp đổ.",
    episodeCount: 31,
  },
  {
    id: "kr-w",
    title: "Kamen Rider W (Double)",
    year: "2009",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "8.3",
    imdbId: "tt1483620",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTAzZTU2ZGYtODg0My00Mzk4LWEwNmYtMGRkOTgzNzhmZDE1XkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BMTAzZTU2ZGYtODg0My00Mzk4LWEwNmYtMGRkOTgzNzhmZDE1XkEyXkFqcGc@._V1_.jpg",
    description:
      "Shotaro và Philip hợp nhất thành Kamen Rider W để điều tra những vụ án Dopant tại Fuuto.",
    episodeCount: 49,
  },
  {
    id: "kr-ooo",
    title: "Kamen Rider OOO",
    year: "2010",
    genre: "Hành động, Phiêu lưu, Chính kịch, Giả tưởng, Tokusatsu",
    rating: "8.1",
    imdbId: "tt1825371",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNWY1YWM0MzctODMyNS00YWM1LWJmNDItYzBlMTNiM2Y2YmZjXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNWY1YWM0MzctODMyNS00YWM1LWJmNDItYzBlMTNiM2Y2YmZjXkEyXkFqcGc@._V1_.jpg",
    description:
      "Eiji Hino biến thân thành OOO bằng những Core Medal để ngăn Greeed chiếm lấy thế giới.",
    episodeCount: 48,
  },
  {
    id: "kr-fourze",
    title: "Kamen Rider Fourze",
    year: "2011",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.6",
    imdbId: "tt2074027",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BOTYzYjI5N2UtNjE5My00MTU3LTg3NjItOGY2NTQwMzUzMTY4XkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BOTYzYjI5N2UtNjE5My00MTU3LTg3NjItOGY2NTQwMzUzMTY4XkEyXkFqcGc@._V1_.jpg",
    description:
      "Gentaro Kisaragi kết bạn với mọi học sinh trong trường và dùng sức mạnh không gian của Fourze.",
    episodeCount: 48,
  },
  {
    id: "kr-wizard",
    title: "Kamen Rider Wizard",
    year: "2012",
    genre: "Hành động, Phiêu lưu, Chính kịch, Giả tưởng, Tokusatsu",
    rating: "6.7",
    imdbId: "tt2238472",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNTkyOTViNDUtZTM5Ni00MGYzLTg4YTItZDgyMGM4YjdhYzcyXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNTkyOTViNDUtZTM5Ni00MGYzLTg4YTItZDgyMGM4YjdhYzcyXkEyXkFqcGc@._V1_.jpg",
    description:
      "Haruto Soma trở thành Wizard để bảo vệ những người tuyệt vọng khỏi Phantom.",
    episodeCount: 53,
  },
  {
    id: "kr-gaim",
    title: "Kamen Rider Gaim",
    year: "2013",
    genre: "Hành động, Phiêu lưu, Chính kịch, Giả tưởng, Tokusatsu",
    rating: "8.1",
    imdbId: "tt3079058",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BMzI3MWVhMTEtNzFkNS00MDBiLTk3YmYtY2QzODVkOGExZTEyXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BMzI3MWVhMTEtNzFkNS00MDBiLTk3YmYtY2QzODVkOGExZTEyXkEyXkFqcGc@._V1_.jpg",
    description:
      "Kouta Kazuraba đối đầu với quái vật từ Helheim và cuộc chiến giành quyền lực giữa các Rider.",
    episodeCount: 47,
  },
  {
    id: "kr-drive",
    title: "Kamen Rider Drive",
    year: "2014",
    genre: "Hành động, Phiêu lưu, Tội phạm, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.7",
    imdbId: "tt3786488",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BYTAxOTMyY2QtMGViYi00YTA0LWEwYzEtODQ1YjYwNDQ3ZjJkXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BYTAxOTMyY2QtMGViYi00YTA0LWEwYzEtODQ1YjYwNDQ3ZjJkXkEyXkFqcGc@._V1_.jpg",
    description:
      "Thanh tra Shinnosuke Tomari và chiếc xe Tridoron chiến đấu với Roidmude đang đe dọa nhân loại.",
    episodeCount: 48,
  },
  {
    id: "kr-ghost",
    title: "Kamen Rider Ghost",
    year: "2015",
    genre: "Hành động, Phiêu lưu, Chính kịch, Giả tưởng, Tokusatsu",
    rating: "6.0",
    imdbId: "tt4727580",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BYjljNDA4ZTAtNWM5NC00ZGQ2LTk4MzktY2NlNGUxMmE2OTBmXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BYjljNDA4ZTAtNWM5NC00ZGQ2LTk4MzktY2NlNGUxMmE2OTBmXkEyXkFqcGc@._V1_.jpg",
    description:
      "Takeru Tenkuji có 99 ngày để thu thập Eyecon và trở lại cuộc sống sau khi trở thành Ghost.",
    episodeCount: 50,
  },
  {
    id: "kr-ex-aid",
    title: "Kamen Rider Ex-Aid",
    year: "2016",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "7.7",
    imdbId: "tt5813014",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BN2NjNGI2ZGMtOWJhZS00OTBjLTg4ZDUtYjcxNzA0N2YxMWM2XkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BN2NjNGI2ZGMtOWJhZS00OTBjLTg4ZDUtYjcxNzA0N2YxMWM2XkEyXkFqcGc@._V1_.jpg",
    description:
      "Bác sĩ Emu Hojo hóa thân thành Ex-Aid để cứu bệnh nhân khỏi virus Bugster trong trò chơi điện tử.",
    episodeCount: 45,
  },
  {
    id: "kr-zi-o",
    title: "Kamen Rider Zi-O",
    year: "2018",
    genre: "Hành động, Phiêu lưu, Chính kịch, Khoa học viễn tưởng, Tokusatsu",
    rating: "6.7",
    imdbId: "tt8716268",
    isNew: false,
    poster:
      "https://m.media-amazon.com/images/M/MV5BNTM1ZGQ0MTAtZTNmNS00MjRhLWE0MTktNTIwOTE0MTg3YjIxXkEyXkFqcGc@._V1_.jpg",
    backdrop:
      "https://m.media-amazon.com/images/M/MV5BNTM1ZGQ0MTAtZTNmNS00MjRhLWE0MTktNTIwOTE0MTg3YjIxXkEyXkFqcGc@._V1_.jpg",
    description:
      "Sougo Tokiwa du hành qua các thời đại Rider để đối mặt với định mệnh trở thành vua thời gian.",
    episodeCount: 49,
  },
  {
    id: "n33",
    title: "Interstellar 2",
    year: "2026",
    genre: "Khoa học viễn tưởng",
    rating: "0.0",
    isNew: true,
    poster: interstellar2Poster,
    backdrop:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1800&q=85",
    description:
      "Video concept trailer do người hâm mộ dựng, không phải trailer phim chính thức.",
  },
  {
    id: "n34",
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023",
    genre: "Hoạt hình, Hành động, Phiêu lưu, Khoa học viễn tưởng",
    rating: "8.6",
    isNew: false,
    poster: spidermanPoster,
    backdrop:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1800&q=85",
    description:
      "Miles Morales du hành qua các vũ trụ Spider-Man và đối mặt với lựa chọn có thể thay đổi số phận của mọi người.",
  },
];

export const animePosterMap = {
  n20: godvalleyPoster,
  n21: spyPoster,
  n24: dragonballzPoster,
  n25: bleachPoster,
  n27: fullmetalPoster,
  n29: fairytailPoster,
  n30: heroAcademiaPoster,
  n31: hunterPoster,
  n32: blueLockPoster,
  n33: interstellar2Poster,
  n34: spidermanPoster,
};

for (const [id, poster] of Object.entries(animePosterMap)) {
  const movie = movieSeed.find((entry) => entry.id === id);
  if (movie) {
    movie.poster = poster;
  }
}

function normalizeAnimePosters(movies) {
  if (!Array.isArray(movies)) return movies;
  return movies.map((movie) => {
    if (!movie || typeof movie !== "object") return movie;
    const normalizedMovie = { ...movie };
    if (animePosterMap[normalizedMovie.id]) {
      normalizedMovie.poster = animePosterMap[normalizedMovie.id];
    }
    return normalizedMovie;
  });
}

const DB_KEY = "movieverse_db";
const SEED_MIGRATION_KEY = "movieverse_seed_migration_v10";
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
  "n20",
  "n21",
  "n22",
  "n23",
  "n24",
  "n25",
  "n26",
  "n27",
  "n28",
  "n29",
  "n30",
  "n31",
  "n32",
  "kr-kuuga",
  "kr-agito",
  "kr-ryuki",
  "kr-faiz",
  "kr-blade",
  "kr-hibiki",
  "kr-kabuto",
  "kr-den-o",
  "kr-kiva",
  "kr-decade",
  "kr-w",
  "kr-ooo",
  "kr-fourze",
  "kr-wizard",
  "kr-gaim",
  "kr-drive",
  "kr-ghost",
  "kr-ex-aid",
  "kr-zi-o",
  "n33",
  "n34",
]);
const removedSeedMovieIds = new Set([
  "m8",
  "m2",
  "m6",
  "m7",
  "n1",
  "n2",
  "n3",
  "n4",
  "n26",
  "n28",
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
    "Wildwood",
    "Black Clover",
    "Doraemon",
    "Interstellar",
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
          const titleMigrations = new Map([
            ["n20", "One Piece Film: God Valley"],
            ["n21", "SPY x FAMILY CODE: White"],
            ["n22", "Attack on Titan: Season 1"],
            ["n23", "Naruto: 20th Anniversary"],
            ["n25", "Bleach: Thousand-Year Blood War"],
            ["n29", "Fairy Tail: Nhiệm vụ 100 năm"],
            ["n30", "My Hero Academia: Final Season"],
            ["n31", "Hunter x Hunter: Set 1"],
            ["n32", "Blue Lock vs. U-20 Japan"],
          ]);
          parsed.movies.forEach((movie) => {
            const title = titleMigrations.get(movie.id);
            if (title) movie.title = title;
          });
          parsed.movies = normalizeAnimePosters(parsed.movies);
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
        const normalized = normalizeAnimePosters(parsed.movies);
        const hasPosterChanges = parsed.movies.some(
          (movie, index) =>
            movie?.id &&
            normalized[index] &&
            normalized[index].poster !== movie.poster,
        );
        if (hasPosterChanges || normalized.length !== parsed.movies.length) {
          saveMovieDB(normalized);
          parsed.movies = normalized;
        }
        return normalized;
      }
    }
  } catch (_) {}
  const normalizedSeed = normalizeAnimePosters(movieSeed);
  saveMovieDB(normalizedSeed);
  return normalizedSeed;
}

export function saveMovieDB(movies) {
  localStorage.setItem(DB_KEY, JSON.stringify({ movies }));
}
