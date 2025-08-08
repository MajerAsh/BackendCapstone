import db from "#db/client";
import { createUser } from "#db/queries/users"; //fn to cr8 user in DB
import { createFind } from "#db/queries/finds"; //fn to cr8 mushroom find

//connect to DB, run seed fn, close connection
await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

///////dummy data user (from starter code aside from const user to define user) and 2 finds:

//cr8 test user "foo" w/ password "bar":
async function seed() {
  const user = await createUser("foo", "bar");

  //insert first mushroom find for that user
  await createFind({
    user_id: user.id,
    species: "Morel",
    description: "Found in the forest near a stream.",
    image_url: "https://example.com/morel.jpg",
    latitude: 40.7128,
    longitude: -74.006,
    location: "New York, NY",
    date_found: "2024-04-20",
  });

  await createFind({
    user_id: user.id,
    species: "Chanterelle",
    description: "Mossy hillside. Sunny after rain.",
    image_url: "https://example.com/chanterelle.jpg",
    latitude: 44.0521,
    longitude: -123.0868,
    location: "Eugene, OR",
    date_found: "2024-07-10",
  });
}
