import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

// Initialize the S3 client using environment variables
const s3 = new aws.S3({
  region: process.env.S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Configure multer to upload directly to S3
export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: "public-read", // allows images to be viewed publicly via URL
    key: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});

export default s3;
