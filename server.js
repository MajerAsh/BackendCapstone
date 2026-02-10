import "dotenv/config"; // load env vars before any imports that rely on them
import app from "#app";
import db from "#db/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("S3_PUBLIC_BASE:", process.env.S3_PUBLIC_BASE);

const PORT = process.env.PORT ?? 3000;

await db.connect();

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`Server is Successfully Running, and App is listening on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error("Error occurred, server can't start", error);
    process.exit(1);
  });
}

export { app };
