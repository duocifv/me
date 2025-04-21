import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'me',
  synchronize: false,
  logging: false,
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

if (!dataSource.isInitialized) {
  dataSource.initialize().catch((error) => {
    console.error('Error during DataSource initialization:', error);
  });
}
