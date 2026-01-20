// src/common/uploads/category-image.upload.ts

import multer from 'multer';
import { Options as MulterOptions } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const uploadDir = path.join(
  process.cwd(),
  'images/categories',
);

// Ensure directory exists
fs.mkdirSync(uploadDir, { recursive: true });

export const categoryImageUploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${filename}${ext}`);
    },
  }),

  /**
   * IMPORTANT:
   * ❌ DO NOT pass Error here (TS typing bug)
   * ✅ Just accept or reject file
   */
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(null, false); // ← THIS IS THE KEY FIX
      return;
    }

    cb(null, true);
  },

  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
