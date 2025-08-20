import "dotenv/config";
import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createFind } from "#db/queries/finds";

// helpers
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

/////////// data pools
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
  // N America
  { location: "Eugene, USA", latitude: 44.0521, longitude: -123.0868 },
  { location: "Seattle, USA", latitude: 47.6062, longitude: -122.3321 },
  { location: "Portland, USA", latitude: 45.5152, longitude: -122.6784 },
  { location: "Burlington, USA", latitude: 44.4759, longitude: -73.2121 },
  { location: "Anchorage, USA", latitude: 61.2181, longitude: -149.9003 },
  { location: "Vancouver, Canada", latitude: 49.2827, longitude: -123.1207 },
  { location: "Quebec City, Canada", latitude: 46.8139, longitude: -71.208 },

  // Europe
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

// base names +  random # suffix so re-seeding doesnt mess it up
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

/////////////////////seeding
async function seed() {
  // original demo user
  const foo = await createUser("foo", "bar");

  // helper to insert a find
  async function addFind(userId, species, spot) {
    await createFind({
      user_id: userId,
      species,
      description: `${species} noted during seeding.`,
      image_url: imageBySpecies[species],
      latitude: spot.latitude,
      longitude: spot.longitude,
      location: spot.location,
      date_found: randomDateWithinYears(2),
      hide_location: false,
    });
  }

  // ensure a user reaches N distinct species (adds more finds if needed)
  async function ensureDistinctSpecies(
    user,
    alreadySpeciesSet,
    targetDistinct
  ) {
    const need = Math.max(0, targetDistinct - alreadySpeciesSet.size);
    if (need === 0) return;

    // available species not yet used by this user
    const pool = speciesList.filter((s) => !alreadySpeciesSet.has(s));
    // if pool smaller than need, we’ll just take what we can (demo scale is fine)
    for (let i = 0; i < need && i < pool.length; i++) {
      const s = pool[i];
      const spot = choice(worldSpots);
      await addFind(user.id, s, spot);
      alreadySpeciesSet.add(s);
    }
  }

  // Give foo exactly 5 distinct species for a “Fruiting” badge
  {
    const base1 = "Morel";
    const base2 = "Chanterelle";
    await addFind(foo.id, base1, {
      location: "New York, NY",
      latitude: 40.7128,
      longitude: -74.006,
    });
    await addFind(foo.id, base2, {
      location: "Eugene, OR",
      latitude: 44.0521,
      longitude: -123.0868,
    });

    const used = new Set([base1, base2]);
    const targets = speciesList.filter((s) => !used.has(s)).slice(0, 3); // +3 = 5 total
    for (const s of targets) {
      await addFind(foo.id, s, choice(worldSpots));
      used.add(s);
    }
  }

  // 20 users × 2 baseline finds each, then “top up” some to hit badges
  for (let i = 0; i < usernames.length; i++) {
    const uname = usernames[i];
    const u = await createUser(uname, "password");

    // two baseline finds (like before)
    const spot1 = choice(worldSpots);
    const spot2 = choice(worldSpots);
    const s1 = choice(speciesList);
    let s2 = choice(speciesList);
    // try to make the second baseline species distinct
    if (s2 === s1) {
      s2 = choice(speciesList.filter((s) => s !== s1)) || s2;
    }

    await addFind(u.id, s1, spot1);
    await addFind(u.id, s2, spot2);

    // distinct species set so far
    const used = new Set([s1, s2]);

    // assign badge targets by simple index pattern:
    //   every 10th user → 25 (Myco Master)
    //   every 10th user where i%10 in {3,4} → 10 (Seasoned)
    //   every 10th user where i%10 in {6,7} → 5 (Fruiting)
    //   rest → keep <5 (no badge)
    let targetDistinct = 0;
    switch (i % 10) {
      case 0:
        targetDistinct = 25;
        break;
      case 3:
      case 4:
        targetDistinct = 10;
        break;
      case 6:
      case 7:
        targetDistinct = 5;
        break;
      default:
        targetDistinct = used.size; // leave as-is (likely <5)
    }

    await ensureDistinctSpecies(u, used, targetDistinct);
  }
}

/* ----------------- run ----------------- */
await db.connect();
try {
  await seed();
  console.log("🌱 Database seeded with demo badge distribution.");
} finally {
  await db.end();
}
