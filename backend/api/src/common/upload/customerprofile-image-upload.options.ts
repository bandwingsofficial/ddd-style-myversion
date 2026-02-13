import multer, { Options as MulterOptions } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const appRoot =
  process.env.APP_ROOT ??
  path.resolve(process.cwd(), '..', '..');

if (!process.env.APP_ROOT) {
  console.warn(
    '⚠️ APP_ROOT not set, using fallback:',
    appRoot,
  );
}

const baseUploadDir = path.join(
  appRoot,
  'images',
  'customerprofile',
  'avatar',
);

if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

export const customerProfileImageUploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, baseUploadDir);
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
    fileSize: 10 * 1024 * 1024,
  },
};
