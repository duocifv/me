import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/tmp',
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const sanitized = file.originalname.replace(/\s+/g, '_');
      cb(null, `${timestamp}-${sanitized}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Chỉ cho phép PNG, JPEG, GIF'), false);
    }
    cb(null, true);
  },
};
