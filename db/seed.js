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

// app.js has import app.use("/images", express.static(path.resolve("public_images")));

const imageBySpecies = {
  Morel: "/images/morel.webp",
  Chanterelle: "/images/chanterelle.webp",
  Oyster: "/images/oyster.jpg",
  Shiitake: "/images/shiitake.jpg",
  Porcini: "/images/porcini.jpg",
  Enoki: "/images/enoki.jpg",
  "Lion's Mane": "/images/lions-mane.png",
  "Turkey Tail": "/images/turkey-tail.webp",
  Maitake: "/images/maitake.webp",
  "Black Trumpet": "/images/black-trumpet.webp",
};

const worldSpots = [
  // North America (temperate, forested)
  { location: "Eugene, USA", latitude: 44.0521, longitude: -123.0868 },
  { location: "Seattle, USA", latitude: 47.6062, longitude: -122.3321 },
  { location: "Portland, USA", latitude: 45.5152, longitude: -122.6784 },
  { location: "Burlington, USA", latitude: 44.4759, longitude: -73.2121 },
  { location: "Anchorage, USA", latitude: 61.2181, longitude: -149.9003 },
  { location: "Vancouver, Canada", latitude: 49.2827, longitude: -123.1207 },
  { location: "Quebec City, Canada", latitude: 46.8139, longitude: -71.208 },

  // Europe (temperate, forested)
  { location: "Stockholm, Sweden", latitude: 59.3293, longitude: 18.0686 },
  { location: "Helsinki, Finland", latitude: 60.1699, longitude: 24.9384 },
  { location: "Oslo, Norway", latitude: 59.9139, longitude: 10.7522 },
  { location: "Berlin, Germany", latitude: 52.52, longitude: 13.405 },
  { location: "Munich, Germany", latitude: 48.1351, longitude: 11.582 },
  { location: "Prague, Czechia", latitude: 50.0755, longitude: 14.4378 },
  { location: "Vienna, Austria", latitude: 48.2082, longitude: 16.3738 },
  { location: "Zurich, Switzerland", latitude: 47.3769, longitude: 8.5417 },
  { location: "Warsaw, Poland", latitude: 52.2297, longitude: 21.0122 },

  // East Asia (all 10 wild; helps cover shiitake)
  { location: "Sapporo, Japan", latitude: 43.0621, longitude: 141.3544 },
  { location: "Sendai, Japan", latitude: 38.2682, longitude: 140.8694 },
  { location: "Seoul, South Korea", latitude: 37.5665, longitude: 126.978 },
  { location: "Harbin, China", latitude: 45.8038, longitude: 126.5349 },
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
    image_url: imageBySpecies["Morel"],
    latitude: 40.7128,
    longitude: -74.006,
    location: "New York, NY",
    date_found: "2024-04-20",
  });

  await createFind({
    user_id: foo.id,
    species: "Chanterelle",
    description: "Mossy hillside. Sunny after rain.",
    image_url: imageBySpecies["Chanterelle"],
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
      image_url: imageBySpecies[s1],
      latitude: spot1.latitude,
      longitude: spot1.longitude,
      location: spot1.location,
      date_found: randomDateWithinYears(2),
    });

    await createFind({
      user_id: u.id,
      species: s2,
      description: `${s2} cluster by fallen log. Moist substrate.`,
      image_url: imageBySpecies[s2],
      latitude: spot2.latitude,
      longitude: spot2.longitude,
      location: spot2.location,
      date_found: randomDateWithinYears(2),
    });
  }
}

/* ----------------- run ----------------- */
await db.connect();
try {
  await seed();
  console.log("🌱 Database seeded.");
} finally {
  await db.end();
}
