// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
      max: 500,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
