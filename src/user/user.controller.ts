import { FastifyPluginCallback } from 'fastify';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

export const userRoutes: FastifyPluginCallback = (app, _opts, done) => {
  // Khởi tạo instance của UserService chỉ một lần khi cần.
  const userService = new UserService();

  // Route lấy tất cả người dùng
  app.get('/', async (req, reply) => {
    
    try {
      const users = await userService.findAll();
      reply.send(users); // Gửi phản hồi trực tiếp
    } catch (error) {
      reply.status(500).send({ error: 'Không thể lấy danh sách người dùng' });
    }
  });

  // Route lấy người dùng theo ID
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: number };
    try {
      const user = await userService.findOne(id);
      if (!user) {
        reply.status(404).send({ error: 'Người dùng không tồn tại' });
      } else {
        reply.send(user);
      }
    } catch (error) {
      reply.status(500).send({ error: 'Lỗi khi lấy người dùng' });
    }
  });

  // Route tạo người dùng mới
  app.post('/', async (req, reply) => {
    const dto = req.body as CreateUserDto;
    try {
      const newUser = await userService.create(dto);
      reply.status(201).send(newUser);
    } catch (error) {
      reply.status(500).send({ error: 'Không thể tạo người dùng' });
    }
  });

  // Route cập nhật thông tin người dùng
  app.put('/:id', async (req, reply) => {
    const { id } = req.params as { id: number };
    const dto = req.body as Partial<CreateUserDto>;
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
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: number };
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
