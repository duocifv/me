import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModuleOptions } from '@nestjs/jwt';
// import { RedisModuleOptions } from 'nestjs-redis';
// import { ClientOptions } from '@elastic/elasticsearch';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  // Cổng HTTP
  get port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  // Cấu hình TypeORM
  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.config.get('DB_HOST'),
      port: this.config.get<number>('DB_PORT'),
      username: this.config.get('DB_USER'),
      password: this.config.get('DB_PASS'),
      database: this.config.get('DB_NAME'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: this.config.get<boolean>('DB_SYNC'),
      autoLoadEntities: true,
    };
  }

  // Cấu hình JWT
  get jwtConfig(): JwtModuleOptions {
    return {
      secret: this.config.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') },
    };
  }

  // // Cấu hình Redis (cho CacheModule hoặc RedisModule)
  // get redisConfig(): RedisModuleOptions {
  //   return {
  //     url: `redis://${this.config.get('REDIS_HOST')}:${this.config.get('REDIS_PORT')}`,
  //     password: this.config.get<string>('REDIS_PASSWORD'),
  //   };
  // }

  // // Cấu hình Elasticsearch
  // get elasticConfig(): ClientOptions {
  //   return {
  //     node: `http://${this.config.get('ELASTIC_HOST')}:${this.config.get('ELASTIC_PORT')}`,
  //     auth: {
  //       username: this.config.get('ELASTIC_USER'),
  //       password: this.config.get('ELASTIC_PASS'),
  //     },
  //   };
  // }
}
