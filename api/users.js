import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserByUsernameAndPassword } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import { searchUsersByUsername } from "#db/queries/users"; //FF
import { getFindsByUsername } from "#db/queries/finds"; //FF

router
  .route("/register")
  .post(requireBody(["username", "password"]), async (req, res) => {
    const { username, password } = req.body;
    const user = await createUser(username, password);

    const token = await createToken({ id: user.id });
    res.status(201).send(token);
  });

router
  .route("/login")
  .post(requireBody(["username", "password"]), async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsernameAndPassword(username, password);
    if (!user) return res.status(401).send("Invalid username or password.");

    const token = await createToken({ id: user.id });
    res.send(token);
  });

//FF:
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) return res.send([]); // empty until user types
    const users = await searchUsersByUsername(search);
    res.send(users);
  } catch (e) {
    next(e);
  }
});

//FF:
router.get("/:username/finds", async (req, res, next) => {
  try {
    const { username } = req.params;
    const finds = await getFindsByUsername(username);
    res.send(finds);
  } catch (e) {
    next(e);
  }
});
