// src/redis/redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Lưu giá trị vào cache.
   * Nếu value là object/array thì sẽ stringify.
   * Sử dụng TTL mặc định (đã cấu hình trong RedisModule).
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds !== undefined) {
      await this.cacheManager.set(key, payload, ttlSeconds);
    } else {
      await this.cacheManager.set(key, payload);
    }
  }

  /**
   * Lấy giá trị từ cache.
   * Trả về null nếu không tồn tại.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const val = await this.cacheManager.get<string>(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      // Nếu không parse được JSON thì trả thẳng string
      return val as unknown as T;
    }
  }

  /**
   * Xoá một key khỏi cache.
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Trả về danh sách key matching pattern.
   * Với in-memory store, ta đọc từ private keyCache.
   */
  keys(pattern = '*'): Promise<string[]> {
    // @ts-expect-error cần truy cập đến keyCache private
    const store: any = this.cacheManager.store;
    if (store && store.keyCache) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const keys = Object.keys(store.keyCache).filter((k) => regex.test(k));
      return Promise.resolve(keys);
    }
    return Promise.resolve([]);
  }
}
