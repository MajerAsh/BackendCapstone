import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createFind } from "#db/queries/finds";

/* ----------------- helpers ----------------- */
function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomDateWithinYears(years = 2) {
  const now = new Date();
  const past = new Date();
  past.setFullYear(now.getFullYear() - years);
  const date = new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/* ----------------- data pools ----------------- */
const speciesList = [
  "Morel",
  "Chanterelle",
  "Oyster",
  "Shiitake",
  "Porcini",
  "Enoki",
  "Lion's Mane",
  "Turkey Tail",
  "Maitake",
  "Black Trumpet",
];

const imagePool = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Morchella%20esculenta%203.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Chanterelle%20Cantharellus%20cibarius.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Pleurotus%20ostreatus%20JPG6.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Lentinula%20edodes%2020100918.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Boletus%20edulis%20EtgHoll.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Enokitake.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Hericium%20erinaceus%20IW.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Trametes%20versicolor%20JPG1.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Grifola%20frondosa%202010%20G1.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Craterellus%20cornucopioides%202.jpg",
];

const worldSpots = [
  { location: "New York, USA", latitude: 40.7128, longitude: -74.006 },
  { location: "Eugene, USA", latitude: 44.0521, longitude: -123.0868 },
  { location: "Vancouver, Canada", latitude: 49.2827, longitude: -123.1207 },
  { location: "Mexico City, Mexico", latitude: 19.4326, longitude: -99.1332 },
  {
    location: "Rio de Janeiro, Brazil",
    latitude: -22.9068,
    longitude: -43.1729,
  },
  {
    location: "Buenos Aires, Argentina",
    latitude: -34.6037,
    longitude: -58.3816,
  },
  { location: "Reykjavík, Iceland", latitude: 64.1466, longitude: -21.9426 },
  { location: "London, UK", latitude: 51.5072, longitude: -0.1276 },
  { location: "Paris, France", latitude: 48.8566, longitude: 2.3522 },
  { location: "Berlin, Germany", latitude: 52.52, longitude: 13.405 },
  { location: "Rome, Italy", latitude: 41.9028, longitude: 12.4964 },
  { location: "Madrid, Spain", latitude: 40.4168, longitude: -3.7038 },
  { location: "Lisbon, Portugal", latitude: 38.7223, longitude: -9.1393 },
  { location: "Stockholm, Sweden", latitude: 59.3293, longitude: 18.0686 },
  { location: "Athens, Greece", latitude: 37.9838, longitude: 23.7275 },
  { location: "Cairo, Egypt", latitude: 30.0444, longitude: 31.2357 },
  { location: "Nairobi, Kenya", latitude: -1.2921, longitude: 36.8219 },
  {
    location: "Cape Town, South Africa",
    latitude: -33.9249,
    longitude: 18.4241,
  },
  { location: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708 },
  { location: "Mumbai, India", latitude: 19.076, longitude: 72.8777 },
  { location: "Bangkok, Thailand", latitude: 13.7563, longitude: 100.5018 },
  { location: "Singapore, Singapore", latitude: 1.3521, longitude: 103.8198 },
  { location: "Hong Kong, China", latitude: 22.3193, longitude: 114.1694 },
  { location: "Seoul, South Korea", latitude: 37.5665, longitude: 126.978 },
  { location: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503 },
  { location: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
  {
    location: "Auckland, New Zealand",
    latitude: -36.8509,
    longitude: 174.7645,
  },
  { location: "Honolulu, USA", latitude: 21.3069, longitude: -157.8583 },
  { location: "Anchorage, USA", latitude: 61.2181, longitude: -149.9003 },
  { location: "Helsinki, Finland", latitude: 60.1699, longitude: 24.9384 },
];

// base names then add random suffix so re-seeding never collides
const baseUsernames = [
  "forest_finder",
  "spore_scout",
  "fungi_friend",
  "gill_seeker",
  "cap_collector",
  "myco_mary",
  "porcini_pete",
  "chanterelle_cher",
  "oyster_olivia",
  "shiitake_sam",
  "trumpet_tara",
  "lionmane_lee",
  "enoki_elliot",
  "maitake_mia",
  "turkeytail_tom",
  "morel_morgan",
  "boletus_ben",
  "myco_mira",
  "spore_sage",
  "cap_carmen",
];
const usernames = baseUsernames.map(
  (n) => `${n}_${Math.floor(100 + Math.random() * 900)}`
);

/* ----------------- seeding ----------------- */
async function seed() {
  // original demo user
  const foo = await createUser("foo", "bar");

  await createFind({
    user_id: foo.id,
    species: "Morel",
    description: "Found in the forest near a stream.",
    image_url: choice(imagePool),
    latitude: 40.7128,
    longitude: -74.006,
    location: "New York, NY",
    date_found: "2024-04-20",
  });

  await createFind({
    user_id: foo.id,
    species: "Chanterelle",
    description: "Mossy hillside. Sunny after rain.",
    image_url: choice(imagePool),
    latitude: 44.0521,
    longitude: -123.0868,
    location: "Eugene, OR",
    date_found: "2024-07-10",
  });

  // 20 users × 2 finds each
  for (const uname of usernames) {
    const u = await createUser(uname, "password");

    const spot1 = choice(worldSpots);
    const spot2 = choice(worldSpots);
    const s1 = choice(speciesList);
    const s2 = choice(speciesList);

    await createFind({
      user_id: u.id,
      species: s1,
      description: `${s1} spotted near trail. Fresh cap, good condition.`,
      image_url: choice(imagePool),
      latitude: spot1.latitude,
      longitude: spot1.longitude,
      location: spot1.location,
      date_found: randomDateWithinYears(2),
    });

    await createFind({
      user_id: u.id,
      species: s2,
      description: `${s2} cluster by fallen log. Moist substrate.`,
      image_url: choice(imagePool),
      latitude: spot2.latitude,
      longitude: spot2.longitude,
      location: spot2.location,
      date_found: randomDateWithinYears(2),
    });
  }
}

/* -----------------run ----------------- */
await db.connect();
try {
  await seed();
  console.log("🌱 Database seeded.");
} finally {
  await db.end();
}
