import multer from "multer";
import path from "path";
import fs from "fs";

// ── Ensure upload folder exists (Render's filesystem won't have empty folders from Git) ──
const uploadDir = "uploads/complaints";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage,
});

export default upload;