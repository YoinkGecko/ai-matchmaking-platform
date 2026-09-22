import fs from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";

const uploadDir = path.join(process.cwd(), "uploads", "offerings");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export const offeringPhotosUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.has(ext)) {
      cb(new Error("Only image files (jpg, png, webp, gif) are allowed"));
      return;
    }
    cb(null, true);
  },
}).array("photos", 6);

export function offeringPhotoPublicPaths(
  files: Express.Multer.File[] | undefined,
): string[] {
  if (!files?.length) {
    return [];
  }
  return files.map((f) => `/uploads/offerings/${f.filename}`);
}
