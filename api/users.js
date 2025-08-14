import express from "express";
const router = express.Router();

import {
  createUser,
  getUserByUsernameAndPassword,
  searchUsersByUsername,
} from "#db/queries/users";
import { getFindsByUsername } from "#db/queries/finds"; //FF
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";

//////////////AUTH ROUTES:

//POST: creates user and returns a JWT token on success
router
  .route("/register")
  .post(requireBody(["username", "password"]), async (req, res, next) => {
    try {
      const { username, password } = req.body;
      //assumes db hashes password
      const user = await createUser(username, password);
      //attch a JWT to user's id
      const token = await createToken({ id: user.id }); //await needed???
      //return token to store user token
      res.status(201).send(token);
    } catch (e) {
      // unique violation handled by handlePostgresErrors.js (409)
      next(e);
    }
  });

// POST /users/login
//confirms authorization and returns a JWT token
router.route("/login").post(
  requireBody(["username", "password"]), // makes sure both fields present
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      //validate credentials; returns user or null
      const user = await getUserByUsernameAndPassword(username, password);
      if (!user) return res.status(401).send("Invalid username or password.");
      // gives a signed token for the session:
      const token = await createToken({ id: user.id });
      res.send(token);
    } catch (e) {
      next(e);
    }
  }
);

// GET /users?search=
//Find user (the search): WITH AUTO GUESS FEATURE 🤖
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) return res.send([]); // empty until user types
    // Delegate search logic to the DB layer (handles LIKE/ILIKE, limits...)
    const users = await searchUsersByUsername(search);
    res.send(users);
  } catch (e) {
    next(e);
  }
});
/*^^for that neat feature: frontend sends a GET request to /users?search=term.
Then, BE calls searchUsersByUsername(search) (in db/queries/users.js), which runs 
that neat ILIKE % || $ || % */

//User's public finds:
router.get("/:username/finds", async (req, res, next) => {
  try {
    const { username } = req.params;
    const finds = await getFindsByUsername(username);
    res.send(finds);
  } catch (e) {
    next(e);
  }
});

export default router;
