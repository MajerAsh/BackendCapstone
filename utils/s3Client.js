import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import fs from "node:fs";
import path from "node:path";

// Helper to check required env vars for S3
const hasS3Creds =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET;

let s3 = null;
let upload = null;

if (!hasS3Creds) {
  console.warn(
    "S3 credentials or bucket not found in environment; falling back to local disk uploads (uploads/)."
  );

  // ensure uploads directory exists
  const uploadsDir = path.resolve("uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // local disk storage fallback for development without S3 credentials
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  upload = multer({ storage });
} else {
  // Initialize AWS SDK v3 S3 client using environment variables
  s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Configure multer to upload directly to S3 using multer-s3
  upload = multer({
    storage: multerS3({
      s3, // S3Client (v3)
      bucket: process.env.S3_BUCKET,
      acl: "public-read",
      key: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    }),
  });
}

export { upload };
export default s3;
