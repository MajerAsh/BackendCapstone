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

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ })); //CORS setup:allow requests from configured origin or any localhost
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parse URL-encoded stuff (form submissions)
app.use(getUserFromToken);

//Serve uploaded files at /uploads/*
app.use("/uploads", express.static(path.resolve("uploads")));
//root route: — quick test endpoint
app.get("/", (req, res) => res.send("Hello, World!"));
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
