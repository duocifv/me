// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClient;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL!);
  }

  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    return val ? (JSON.parse(val) as T) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern = '*'): Promise<string[]> {
    return await this.client.keys(pattern); // ✅ Không còn warning
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
