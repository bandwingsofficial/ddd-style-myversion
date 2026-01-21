import multer, { Options as MulterOptions } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const appRoot =
  process.env.APP_ROOT ??
  path.resolve(process.cwd(), '..', '..'); // same fallback as category

if (!process.env.APP_ROOT) {
  console.warn(
    '⚠️ APP_ROOT not set, using fallback:',
    appRoot,
  );
}

const uploadDir = path.join(
  appRoot,
  'images',
  'products',
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const productImageUploadOptions: MulterOptions = {
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

  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },

  limits: {
    fileSize: 10 * 1024 * 1024, // 3MB (products usually need more than categories)
  },
};
