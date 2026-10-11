// Books on the About page shelf, in shelf order (left to right).
// Covers live in public/books/. Spine width loosely tracks page count;
// height and spine colours are picked to echo each cover.
export interface Book {
  id: string;
  title: string;
  author: string;
  year?: number;
  genre: string;
  cover: string;
  /** Cover image aspect ratio, width / height. */
  coverRatio: number;
  spine: string;
  spineText: string;
  spineW: number;
  h: number;
  /** One-line premise. */
  about: string;
  /** What Sanket took from it, in his voice. */
  lesson: string;
}

export const BOOKS: Book[] = [
  {
    id: "tomorrow",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    year: 2022,
    genre: "Fiction",
    cover: "/books/tomorrow.jpg",
    coverRatio: 329 / 500,
    spine: "#1F3A5F",
    spineText: "#F6E7B0",
    spineW: 46,
    h: 292,
    about:
      "Two friends, Sam and Sadie, spend thirty years making video games together, falling out, and finding their way back.",
    lesson:
      "The best work comes out of long creative partnerships, and those survive on forgiveness more than talent. It also made me take play seriously: a good game, like a good interface, is a world someone built so other people could move through it.",
  },
  {
    id: "beyond-tools",
    title: "Beyond Tools",
    author: "Amit Das",
    genre: "Non-fiction · Design",
    cover: "/books/beyond-tools.jpg",
    coverRatio: 405 / 600,
    spine: "#C8322A",
    spineText: "#FFFFFF",
    spineW: 34,
    h: 270,
    about:
      "A practical guide for designers to become irreplaceable, from the head of design at Urban Company. The one in the photo on my homepage.",
    lesson:
      "Tools change every year; judgment doesn't go out of date. The designers who stay valuable are the ones who can explain why a screen should exist, not just make it look right.",
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "Non-fiction · Habits",
    cover: "/books/atomic-habits.jpg",
    coverRatio: 369 / 500,
    spine: "#ECE4D8",
    spineText: "#7A6545",
    spineW: 38,
    h: 282,
    about:
      "Small changes, compounded: how habits form, and how to build ones that stick.",
    lesson:
      "Don't wait for motivation, design the environment. Small systems repeated every day beat big goals, which is also how I think about design systems: get the small pieces right and the screens take care of themselves.",
  },
  {
    id: "wildflowers",
    title: "Where the Wildflowers Grow",
    author: "Terah Shelton Harris",
    year: 2026,
    genre: "Fiction",
    cover: "/books/wildflowers.jpg",
    coverRatio: 333 / 500,
    spine: "#2F5E3A",
    spineText: "#F7D7E3",
    spineW: 42,
    h: 300,
    about:
      "The only survivor of a prison bus crash hides out on a flower farm in rural Alabama.",
    lesson:
      "Where you start doesn't decide where you end up. People can grow again in the right soil, given time and someone willing to give them a chance.",
  },
  {
    id: "theo-of-golden",
    title: "Theo of Golden",
    author: "Allen Levi",
    year: 2023,
    genre: "Fiction",
    cover: "/books/theo-of-golden.jpg",
    coverRatio: 329 / 500,
    spine: "#F4EDE0",
    spineText: "#4A4036",
    spineW: 44,
    h: 288,
    about:
      "An elderly stranger buys the portraits hanging in a small-town coffee shop and gives each one to the person in it.",
    lesson:
      "Small, specific kindness changes people more than grand gestures. Really paying attention to someone is a gift, and a good reminder for research too: people open up when they feel seen.",
  },
  {
    id: "correspondent",
    title: "The Correspondent",
    author: "Virginia Evans",
    year: 2025,
    genre: "Fiction",
    cover: "/books/correspondent.jpg",
    coverRatio: 333 / 500,
    spine: "#E9DFD0",
    spineText: "#C0623A",
    spineW: 40,
    h: 294,
    about:
      "A retired lawyer writes letters every morning, to family, friends, strangers, and authors she admires, and slowly lets the past back in.",
    lesson:
      "Writing things down is how you make peace with them. And it is never too late to reach out, apologise, or be honest with the people you love.",
  },
  {
    id: "atmosphere",
    title: "Atmosphere",
    author: "Taylor Jenkins Reid",
    year: 2025,
    genre: "Fiction",
    cover: "/books/atmosphere.jpg",
    coverRatio: 329 / 500,
    spine: "#3E79A6",
    spineText: "#FFFFFF",
    spineW: 40,
    h: 284,
    about:
      "A physics professor joins one of NASA's first Space Shuttle classes to include women, and falls in love.",
    lesson:
      "Courage is mostly quiet preparation. The astronauts rehearse every failure so they can stay calm when it counts, the same reason I design the error states before the happy path.",
  },
  {
    id: "carrie-soto",
    title: "Carrie Soto Is Back",
    author: "Taylor Jenkins Reid",
    year: 2022,
    genre: "Fiction",
    cover: "/books/carrie-soto.jpg",
    coverRatio: 296 / 450,
    spine: "#D99A1F",
    spineText: "#1E1A14",
    spineW: 42,
    h: 290,
    about:
      "A retired tennis champion comes back at thirty-seven, coached by her father, to defend her record.",
    lesson:
      "Being the best and being liked are different goals, and Carrie has to decide which one she is playing for. Coming back late isn't a weakness, and the people in your corner matter more than the trophy count.",
  },
  {
    id: "calamity-club",
    title: "The Calamity Club",
    author: "Kathryn Stockett",
    year: 2026,
    genre: "Fiction",
    cover: "/books/calamity-club.jpg",
    coverRatio: 332 / 500,
    spine: "#EEE8DB",
    spineText: "#2F67A8",
    spineW: 44,
    h: 296,
    about:
      "Depression-era Mississippi: an abandoned girl and two women society has written off join forces to take back what is theirs.",
    lesson:
      "Respectable surfaces can hide a lot. The people everyone writes off are often the most resourceful in the room, and friendship can be its own kind of rescue.",
  },
  {
    id: "my-brilliant-friend",
    title: "My Brilliant Friend",
    author: "Elena Ferrante",
    year: 2012,
    genre: "Fiction",
    cover: "/books/my-brilliant-friend.jpg",
    coverRatio: 304 / 500,
    spine: "#5E7FA0",
    spineText: "#FFFFFF",
    spineW: 40,
    h: 286,
    about:
      "Two girls grow up in a poor, violent neighbourhood in 1950s Naples, bound by a friendship full of love and rivalry.",
    lesson:
      "A friendship can be competitive and still be love. Watching the brilliant one get fewer chances made me think about how much of what we call talent is really access.",
  },
];
