import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import requireUser from "#middleware/requireUser"; //makes sure req.user exists (auth)
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

////Helpers for validation/ error handling:

/*function isValidISODateYYYYMMDD(s) {
  if (typeof s !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
}*/

/*function validateFindFields(fields) {
  // date_found (required on POST, optional on PUT)
  if (
    fields.date_found !== undefined &&
    !isValidISODateYYYYMMDD(fields.date_found)
  ) {
    return "date_found must be YYYY-MM-DD";
  }
  // latitude/longitude if present must be finite numbers
  for (const key of ["latitude", "longitude"]) {
    if (fields[key] !== undefined && fields[key] !== "") {
      const n = Number(fields[key]);
      if (!Number.isFinite(n)) return `${key} must be a number`;
    }
  }
  return null;
}*/

////////////////////////////////////////MULTER set up:

// uploads exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

//Multer storage
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
//filename/ time stamp
const fileFilter = (req, file, cb) => {
  //regex! to cut white space and shorten excessive text
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image uploads are allowed"));
};
// 5MB max file size; use the disk storage + filter the above stuff
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/////////////////////////////////////////////ROUTES:

// GET /finds (public)
router.get("/", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const finds = user_id
      ? await getFindsByUserId(user_id)
      : await getAllFinds();
    res.send(finds);
  } catch (err) {
    next(err); // pass error to mw
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

//GET /finds/:id (auth, owner-only) – prefill the edit form
router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const find = await getFindByIdForUser(req.params.id, req.user.id);
    if (!find) return res.status(404).send("Not found");
    res.send(find);
  } catch (err) {
    next(err);
  }
});

// POST /finds (auth) - create a new find
router.post(
  "/",
  requireUser,
  upload.single("photo"),
  requireBody(["species", "date_found"]),
  async (req, res, next) => {
    try {
      const image_url = req.file ? `/uploads/${req.file.filename}` : null; // if theres a img upload
      const newFind = await createFind({
        ...req.body, // species, date_found, description, latitude, longitude, location
        user_id: req.user.id,
        image_url,
      });
      res.status(201).send(newFind);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /finds/:id (owner only) Edit page: replace data with other data: photo and #s:
router.put(
  "/:id",
  requireUser,
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const fields = { ...req.body };

      // Convert lat/long strings to numbers if provided; drop empty strings:
      if (fields.latitude !== undefined) {
        if (fields.latitude === "") delete fields.latitude;
        else fields.latitude = Number(fields.latitude);
      }

      if (fields.longitude !== undefined) {
        if (fields.longitude === "") delete fields.longitude;
        else fields.longitude = Number(fields.longitude);
      }

      //replaces image_url for edit/ changing photo:
      if (req.file) fields.image_url = `/uploads/${req.file.filename}`;

      //Prunes undefined values to avoid no-op updates:
      Object.keys(fields).forEach((k) => {
        if (fields[k] === undefined) delete fields[k];
      });
      //if updated, returned falsy, either not found or nothing changed
      const updated = await updateFind(req.params.id, req.user.id, fields);
      if (!updated) return res.status(404).send("Updated with no changes");
      res.send(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /finds/:id (auth, owner only)
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    await deleteFind(req.params.id, req.user.id);
    res.send({ message: "Find deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
