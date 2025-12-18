import express from "express";
import { body, validationResult } from "express-validator";
import requireUser from "#middleware/requireUser"; //makes sure req.user exists (auth)
import requireBody from "#middleware/requireBody";
import {
  getAllFinds,
  getMyFinds,
  createFind,
  updateFind,
  deleteFind,
  getFindByIdForUser,
} from "#db/queries/finds";
import { upload } from "#utils/s3Client";

const router = express.Router();

/////////////////////////////////////ROUTES:

// GET /finds (public)
router.get("/", async (req, res, next) => {
  try {
    // Public map only (no user_id filtering here)
    const finds = await getAllFinds(); // excludes hide_location=true in the DB layer
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
  upload.single("photo"), // uploads to S3
  [
    body("species")
      .isLength({ min: 2, max: 64 })
      .withMessage("Species is required (2-64 chars)."),
    body("date_found")
      .isISO8601()
      .withMessage("date_found must be a valid date (YYYY-MM-DD)."),
    body("latitude")
      .optional({ checkFalsy: true })
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90."),
    body("longitude")
      .optional({ checkFalsy: true })
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180."),
    body("description")
      .optional({ checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage("Description too long (max 500 chars)."),
    body("location")
      .optional({ checkFalsy: true })
      .isLength({ max: 128 })
      .withMessage("Location label too long (max 128 chars)."),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  requireBody(["species", "date_found"]),
  async (req, res, next) => {
    try {
      //const image_url = req.file ? req.file.location : null; // ✅ use S3 URL
      const image_url = req.file
        ? req.file.key
          ? `${process.env.S3_PUBLIC_BASE}/${req.file.key}`
          : req.file.location || null
        : null;
      const latitude =
        req.body.latitude === "" || req.body.latitude == null
          ? null
          : Number(req.body.latitude);
      const longitude =
        req.body.longitude === "" || req.body.longitude == null
          ? null
          : Number(req.body.longitude);

      const newFind = await createFind({
        user_id: req.user.id,
        species: req.body.species,
        date_found: req.body.date_found,
        description: req.body.description ?? null,
        location: req.body.location ?? null,
        latitude,
        longitude,
        image_url,
        hide_location: ["true", "1", "on", "yes"].includes(
          String(req.body.hide_location).toLowerCase()
        ),
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
  [
    body("species")
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 64 })
      .withMessage("Species must be 2-64 chars."),
    body("date_found")
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage("date_found must be a valid date (YYYY-MM-DD)."),
    body("latitude")
      .optional({ checkFalsy: true })
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90."),
    body("longitude")
      .optional({ checkFalsy: true })
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180."),
    body("description")
      .optional({ checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage("Description too long (max 500 chars)."),
    body("location")
      .optional({ checkFalsy: true })
      .isLength({ max: 128 })
      .withMessage("Location label too long (max 128 chars)."),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    try {
      // Whitelist allowed fields to prevent clients from updating arbitrary columns
      // (and to avoid SQL injection via untrusted field names).
      const fields = {};
      const allowed = [
        "species",
        "date_found",
        "description",
        "location",
        "latitude",
        "longitude",
        "hide_location",
      ];
      for (const key of allowed) {
        if (req.body[key] !== undefined) fields[key] = req.body[key];
      }

      // If location is present but blank, persist as NULL so the old label is cleared
      if (fields.location !== undefined) {
        if (
          typeof fields.location === "string" &&
          fields.location.trim() === ""
        ) {
          fields.location = null;
        }
      }

      // Convert lat/long strings to numbers if provided; drop empty strings:
      if (fields.latitude !== undefined) {
        if (fields.latitude === "") delete fields.latitude;
        else fields.latitude = Number(fields.latitude);
      }

      if (fields.longitude !== undefined) {
        if (fields.longitude === "") delete fields.longitude;
        else fields.longitude = Number(fields.longitude);
      }
      //hidden location finds
      if (fields.hide_location !== undefined) {
        fields.hide_location = ["true", "1", "on", "yes"].includes(
          String(fields.hide_location).toLowerCase()
        );
      }

      //replaces image_url for edit/ changing photo:
      if (req.file)
        fields.image_url = req.file.key
          ? `${process.env.S3_PUBLIC_BASE}/${req.file.key}`
          : req.file.location || null;

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
