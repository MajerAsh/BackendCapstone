import express from "express";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  getAllFinds,
  getFindsByUserId,
  createFind,
  updateFind,
  deleteFind,
} from "#db/queries/finds";

const router = express.Router();

// GET /finds?user_id=optional (public)
router.get("/", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const finds = user_id
      ? await getFindsByUserId(user_id)
      : await getAllFinds();
    res.send(finds);
  } catch (err) {
    next(err);
  }
});

// POST /finds (auth required/protected)
router.post(
  "/",
  requireUser,
  requireBody(["species", "found_date"]),
  async (req, res, next) => {
    try {
      const newFind = await createFind({ ...req.body, user_id: req.user.id });
      res.status(201).send(newFind);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /finds/:id (protected)
router.put("/:id", requireUser, async (req, res, next) => {
  try {
    const updated = await updateFind(req.params.id, req.user.id, req.body);
    res.send(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /finds/:id (protected)
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    await deleteFind(req.params.id, req.user.id);
    res.send({ message: "Find deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
