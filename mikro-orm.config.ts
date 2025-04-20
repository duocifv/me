import 'dotenv/config';                        // load .env
import { defineConfig, MySqlDriver } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';

const dbUrl = new URL(process.env.DATABASE_URL!);

export default defineConfig({
    driver: MySqlDriver,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    user: dbUrl.username,
    password: dbUrl.password,
    dbName: dbUrl.pathname.substring(1),

    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],

    metadataProvider: TsMorphMetadataProvider,
    extensions: [Migrator],
    migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
        tableName: 'mikro_orm_migrations',
    },
});
