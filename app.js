import express from "express";
import cors from "cors";
import morgan from "morgan"; //logs incoming requests in readable format
import path from "node:path"; //node module for paths

import usersRouter from "#api/users";
import findsRouter from "#api/finds";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";

//species helpers for facts route
import { normalizeName, resolveName, localSafety } from "#utils/species";

const app = express();
export default app;

//CORS
const allowedOrigin = process.env.CORS_ORIGIN || /localhost/;
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files/ photos
app.use("/images", express.static(path.resolve("public_images"))); // for data
app.use("/uploads", express.static(path.resolve("uploads"))); // for uploads

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "MycoMap API is running" });
});

app.use(getUserFromToken);

// "Facts" endpoints
app.get("/mushrooms/facts", async (req, res, next) => {
  try {
    const q = normalizeName(req.query.q);
    if (!q) return res.status(400).send("Missing q");

    const resolvedName = resolveName(q); // coloqial name to latin/resolved name
    const meta = localSafety(resolvedName); //  flags

    res.send({
      query: q,
      name: resolvedName,
      scientific_name: resolvedName,
      common_names: [],
      edible: meta?.edible ?? null,
      deadly: meta?.deadly ?? null,
      toxins: meta?.toxins ?? [],
      syndrome: meta?.syndrome ?? null,
      notes: meta?.notes ?? null,
      deadly_lookalikes: meta?.deadly_lookalikes ?? [],
      look_alikes: [],
      sources: [],
    });
  } catch (e) {
    next(e);
  }
});
//resource routes:
app.use("/users", usersRouter);
app.use("/finds", findsRouter);

// 404 Handler (must come after all routes)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error Handlers
app.use(handlePostgresErrors);

// Final error handler - environment-aware
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    error: err.message || "Something went wrong",
    ...(isDevelopment && { stack: err.stack }),
  });
});
