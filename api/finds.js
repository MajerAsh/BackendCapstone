import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  getAllFinds,
  getFindsByUserId,
  getMyFinds,
  createFind,
  updateFind,
  deleteFind,
  getFindByIdForUser,
} from "#db/queries/finds";

const router = express.Router();

//Configure Multer storage, limits, and filtering
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

//multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base =
      path.basename(file.originalname, ext).replace(/\s+/g, "_").slice(0, 64) ||
      "file";
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image uploads are allowed"));
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB
});

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

// GET /finds/me (auth)
router.get("/me", requireUser, async (req, res, next) => {
  try {
    const finds = await getMyFinds(req.user.id);
    res.send(finds);
  } catch (err) {
    next(err);
  }
});

//GET /finds/:id (auth, owner-only) – used to prefill the edit form
router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const find = await getFindByIdForUser(req.params.id, req.user.id);
    if (!find) return res.status(404).send("Not found");
    res.send(find);
  } catch (err) {
    next(err);
  }
});

// POST /finds (auth required/protected)
router.post(
  "/",
  requireUser,
  upload.single("photo"),
  requireBody(["species", "date_found"]),
  async (req, res, next) => {
    try {
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;
      const newFind = await createFind({
        ...req.body,
        user_id: req.user.id,
        image_url,
      });
      res.status(201).send(newFind);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /finds/:id (owner only) replace data with other data: photo and #s
router.put(
  "/:id",
  requireUser,
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const fields = { ...req.body };

      //string to number conversion unless empty
      if (fields.latitude !== undefined) {
        if (fields.latitude === "") delete fields.latitude;
        else fields.latitude = Number(fields.latitude);
      }

      if (fields.longitude !== undefined) {
        if (fields.longitude === "") delete fields.longitude;
        else fields.longitude = Number(fields.longitude);
      }

      //replaces image_url for a optional photo update
      if (req.file) fields.image_url = `/uploads/${req.file.filename}`;

      // remove keys that are undefined/empty to avoid pointless updates " prune undefined keys"
      Object.keys(fields).forEach((k) => {
        if (fields[k] === undefined) delete fields[k];
      });

      const updated = await updateFind(req.params.id, req.user.id, fields);
      if (!updated) return res.status(404).send("Updated with no changes");
      res.send(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /finds/:id (protected)
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    await deleteFind(req.params.id, req.user.id);
    res.send({ message: "Find deleted" }); // res.status(204).end();  ?
  } catch (err) {
    next(err);
  }
});

export default router;
