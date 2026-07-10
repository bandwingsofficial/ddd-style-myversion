// src/modules/uploads/interfaces/upload-file.interface.ts

export interface UploadFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export type MulterUploadFile = Express.Multer.File;
