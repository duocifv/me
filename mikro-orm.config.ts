import { defineConfig, MySqlDriver } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  driver: MySqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Khanh132132!!',
  dbName: process.env.DB_NAME || 'me',

  entities: [
    process.env.NODE_ENV === 'production'
      ? 'src/**/*.entity.js'
      : 'dist/src/**/*.entity.js',
  ],
  entitiesTs: ['./src/**/*.entity.ts'],

  metadataProvider: TsMorphMetadataProvider,
  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
    tableName: 'mikro_orm_migrations',
  },
});
