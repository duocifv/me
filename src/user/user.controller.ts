import { FastifyPluginCallback } from 'fastify';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { z } from 'zod'; // Import Zod

export const userRoutes: FastifyPluginCallback = (app, _opts, done) => {
  // Khởi tạo instance của UserService chỉ một lần khi cần.
  const userService = new UserService();

  // Route lấy tất cả người dùng
  app.get('/', {
    schema: {
      tags: ['user'],
    },
    config: {
      public: true,
    },
  }, async (req, reply) => {
    try {
      const users = await userService.findAll();
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: 'Không thể lấy danh sách người dùng' });
    }
  });

  // Route lấy người dùng theo ID
  app.get('/:id', {
    schema: {
      tags: ['user'],
      params: z.object({
        id: z.string().uuid(), // Sử dụng zod để xác thực UUID
      }),
    },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const user = await userService.findOne(id);
      if (!user) {
        reply.notFound()
      } else {
        reply.send(user);
      }
    } catch (error) {
      reply.status(500).send({ error: 'Lỗi khi lấy người dùng' });
    }
  });

  // Route tạo người dùng mới
  app.post('/', {
    schema: {
      tags: ['user'],
      body: CreateUserDto, // Sử dụng Zod để xác thực body với CreateUserDto
    },
    config: {
      public: true
    }
  }, async (req, reply) => {
    const dto = req.body as any;
    const user = await userService.create(dto);
    if (!user) {
      reply.notFound('Không thể tạo người dùng')
    }
    return reply.send(user)
  });

  // Route cập nhật thông tin người dùng
  app.put('/:id', {
    schema: {
      tags: ['user'],
      params: z.object({
        id: z.string().uuid(), // Sử dụng zod để xác thực UUID
      }),
      body: CreateUserDto.partial(), // Chỉ cần một phần của CreateUserDto để cập nhật
    },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const dto = req.body as Partial<CreateUserDtoType>;
    try {
      const updatedUser = await userService.update(id, dto);
      if (!updatedUser) {
        reply.status(404).send({ error: 'Người dùng không tồn tại' });
      } else {
        reply.send(updatedUser);
      }
    } catch (error) {
      reply.status(500).send({ error: 'Không thể cập nhật người dùng' });
    }
  });

  // Route xóa người dùng
  app.delete('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid(), // Xác thực ID là UUID
      }),
    },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const deletedUser = await userService.remove(id);
      if (!deletedUser) {
        reply.status(404).send({ error: 'Người dùng không tồn tại' });
      } else {
        reply.send({ message: 'Người dùng đã được xóa' });
      }
    } catch (error) {
      reply.status(500).send({ error: 'Không thể xóa người dùng' });
    }
  });

  done();
};
