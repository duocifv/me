import { FastifyInstance } from 'fastify';
import { ErrorResponse, SuccessResponse, UploadRequestBody } from './schema';
import { uploadService } from './service';

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/upload',
    {
      schema: {
        tags: ["Upload"],
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
          200: SuccessResponse,
          400: ErrorResponse,
          500: ErrorResponse,
        },
      },
    },
    // async (request, reply) => {
    //   try {
    //     const data = await request.file();
    //     const paths = await uploadService(data);

    //     return reply.send({
    //       message: 'Upload thành công!',
    //       ...paths,
    //     });
    //   } catch (error) {
    //     request.log.error(error);
    //     return reply.status(500).send({
    //       error: 'Có lỗi xảy ra trong quá trình xử lý file.',
    //     });
    //   }
    // }
  );
}
