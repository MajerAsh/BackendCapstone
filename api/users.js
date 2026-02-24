import express from "express";
import { body, validationResult } from "express-validator";
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
router.route("/register").post(
  [
    body("username")
      .isLength({ min: 3, max: 32 })
      .withMessage("Username must be 3-32 characters."),
    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be at least 6 characters."),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error:
          "Username must be 3-32 characters. Password must be at least 6 characters.",
      });
    }
    next();
  },
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      //assumes db hashes password
      const user = await createUser(username, password);
      const token = await createToken({ id: user.id });

      res.status(201).json({ token });
    } catch (e) {
      // unique violation handled by handlePostgresErrors.js (409)
      next(e);
    }
  },
);

// POST /users/login
//confirms authorization and returns a JWT token
router.route("/login").post(
  requireBody(["username", "password"]), // makes sure both fields present
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await getUserByUsernameAndPassword(username, password);
      if (!user)
        return res.status(401).json({ error: "Invalid username or password." }); //send to json
      // gives a signed token for the session:
      const token = await createToken({ id: user.id });
      res.json({ token }); //send to json
    } catch (e) {
      next(e);
    }
  },
);

// GET /users?search=
//Find user (the search)
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) return res.send([]);
    // Delegate search logic to the DB layer (handles LIKE/ILIKE, limits...)
    const users = await searchUsersByUsername(search);
    res.send(users);
  } catch (e) {
    next(e);
  }
});
// Username search above (case-insensitive substring match)

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
