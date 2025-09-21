import app from "#app";
import db from "#db/client";
import "dotenv/config";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const PORT = process.env.PORT ?? 3000;

await db.connect();

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

export { app };
