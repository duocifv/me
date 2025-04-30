import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';
import { Type } from '@sinclair/typebox';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { FastifyTypebox } from '../shared/type/root';
import { uploadConfig } from '../shared/config/upload.config';

const UploadRequestBody = Type.Object({
  file: Type.String({ format: 'binary' }),
});

const SuccessResponse = Type.Object({
  message: Type.String(),
  original: Type.String(),
  thumbnail: Type.String(),
  medium: Type.String(),
  large: Type.String(),
});

const ErrorResponse = Type.Object({
  error: Type.String(),
});

export async function uploadPlugin(fastify: FastifyTypebox) {
  fastify.post(
    '/upload',
    {
      schema: {
        summary: 'Upload hình ảnh',
        description: 'Endpoint cho phép upload một file hình ảnh dưới dạng multipart/form-data.',
        consumes: ['multipart/form-data'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: UploadRequestBody },
          },
        },
        response: {
          200: {
            description: 'Upload thành công',
            content: {
              'application/json': { schema: SuccessResponse },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = await request.file();

        if (!uploadConfig.allowedMimeTypes.includes(data.mimetype)) {
          return reply.status(400).send({
            error: 'File không hợp lệ. Chỉ cho phép các định dạng hình ảnh phổ biến.',
          });
        }

        const uploadDir = path.join(__dirname, uploadConfig.uploadDir);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const chunks: Buffer[] = [];
        for await (const chunk of data.file) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const uuid = uuidv4();
        const ext = uploadConfig.outputFormat;

        const paths = {
          original: path.join(uploadDir, `${uuid}-original.${ext}`),
          thumbnail: path.join(uploadDir, `${uuid}-thumbnail.${ext}`),
          medium: path.join(uploadDir, `${uuid}-medium.${ext}`),
          large: path.join(uploadDir, `${uuid}-large.${ext}`),
        };

        await sharp(buffer)
          .toFormat(ext, { quality: uploadConfig.quality.original })
          .toFile(paths.original);

        await sharp(buffer)
          .resize({ width: uploadConfig.sizes.thumbnail })
          .toFormat(ext, { quality: uploadConfig.quality.resized })
          .toFile(paths.thumbnail);

        await sharp(buffer)
          .resize({ width: uploadConfig.sizes.medium })
          .toFormat(ext, { quality: uploadConfig.quality.resized })
          .toFile(paths.medium);

        await sharp(buffer)
          .resize({ width: uploadConfig.sizes.large })
          .toFormat(ext, { quality: uploadConfig.quality.resized })
          .toFile(paths.large);

        return reply.send({
          message: 'Upload thành công!',
          original: paths.original,
          thumbnail: paths.thumbnail,
          medium: paths.medium,
          large: paths.large,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Có lỗi xảy ra trong quá trình xử lý file.',
        });
      }
    }
  );
}
