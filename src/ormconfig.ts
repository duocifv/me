import { DataSource } from 'typeorm';

export const db = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [__dirname + "src/entity/*{.js,.ts}"],
  migrations: ['./src/migrations/*.ts'],
  subscribers: [],
});
