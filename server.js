// server.js
const Fastify = require('fastify');
const { PrismaClient } = require('./generated/prisma')

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// GET /users: trả về danh sách user
fastify.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany();
  reply.send(users);
});

// POST /users: tạo mới user
fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body;
  const newUser = await prisma.user.create({
    data: { name, email },
  });
  reply.code(201).send(newUser);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server chạy tại http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
