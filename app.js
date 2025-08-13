import express from "express";
const app = express();
export default app;

//routers for specific resources
import usersRouter from "#api/users";
import findsRouter from "#api/finds";

//middleware
import getUserFromToken from "#middleware/getUserFromToken"; //attach user info to req if valid JWT provided
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import cors from "cors";
import morgan from "morgan"; //logs incoming requests in readable format
import path from "node:path"; //Node module for paths

//species helpers for facts route
import { normalizeName, resolveName, localSafety } from "#utils/species"; //fact warning

//photos
app.use("/images", express.static(path.resolve("public_images"))); // dummy data
app.use("/uploads", express.static(path.resolve("uploads"))); //for uploaded files at /uploads/

app.use(getUserFromToken);
app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ })); //CORS setup:allow requests
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parse URL-encoded stuff (form submissions)

//test
app.get("/", (req, res) => res.send("Test endpoint!"));

/////////////////////facts endpoint::::::::::::
app.get("/mushrooms/facts", async (req, res, next) => {
  try {
    const q = normalizeName(req.query.q);
    if (!q) return res.status(400).send("Missing q");

    const resolvedName = resolveName(q); // coloqial name to latin/resolved name
    const meta = localSafety(resolvedName); //  flags

    res.send({
      query: q,
      name: resolvedName, // resolved scientific name
      scientific_name: resolvedName, //^
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

//custom Postgres error handler:
app.use(handlePostgresErrors);

//generic last resort error handler:
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});
