import { CreateUserDto, SelectDto, UpdateUserDto } from './user.dto';
import { RouteInstance } from '../middlewares/zod/fastify-zod.type';
import { PaginationDto } from 'src/middlewares/pagination.middleware';

export async function userRoutes(route: RouteInstance) {
  const userService =  userService(route);

  route.get(
    '/',
    {
      schema: {
        tags: ['user'],
        querystring: PaginationDto,
      },
      config: {
        public: true,
      },
    },
    async (req, res) => {
      const { take, skip } = req.paginationDto();
      const [data, count] = await userService.findAll(take, skip);
      return res.paginationData(data, count, take, skip);
    }
  );

  route.get(
    '/:id',
    {
      schema: {
        tags: ['user'],
        params: SelectDto,
      },
    },
    async (req) => {
      const dto = req.params;
      return await userService.findOne(dto);
    }
  );

  route.post(
    '/',
    {
      schema: {
        tags: ['user'],
        body: CreateUserDto,
      },
      config: {
        public: true,
      },
    },
    async (req) => {
      const dto = req.body;
      return await userService.create(dto);
    }
  );

  route.put(
    '/:id',
    {
      schema: {
        tags: ['user'],
        params: SelectDto,
        body: UpdateUserDto,
      },
    },
    async (req) => {
      const dto = { ...req.body, id: req.params.id };
      return await userService.update(dto);
    }
  );

  route.delete(
    '/:id',
    {
      schema: {
        tags: ['user'],
        params: SelectDto,
      },
    },
    async (req) => {
      const dto = req.params;
      return await userService.remove(dto);
    }
  );
}
