import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createFind } from "#db/queries/finds";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  await createUser("foo", "bar");
}

await createFind({
  userId: user.id,
  species: "Morel",
  description: "Found in the forest near a stream.",
  imageUrl: "https://example.com/morel.jpg",
  latitude: 40.7128,
  longitude: -74.006,
  location: "New York, NY",
  dateFound: "2024-04-20",
});
