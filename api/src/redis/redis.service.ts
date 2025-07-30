import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');

function getPath(key: string): string {
  return path.join(CACHE_DIR, encodeURIComponent(key) + '.json');
}

@Injectable()
export class RedisService {
  private isInitialized = false;

  private async ensureCacheDir() {
    if (!this.isInitialized) {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      this.isInitialized = true;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.ensureCacheDir();
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    const content = JSON.stringify({ value: payload, expiresAt });
    await fs.writeFile(getPath(key), content, 'utf8');
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    await this.ensureCacheDir();
    try {
      const raw = await fs.readFile(getPath(key), 'utf8');
      const { value, expiresAt } = JSON.parse(raw);
      if (expiresAt && Date.now() > expiresAt) {
        await fs.unlink(getPath(key));
        return null;
      }
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.ensureCacheDir();
    try {
      await fs.unlink(getPath(key));
    } catch {
      // ignore error if file does not exist
    }
  }

  async keys(pattern = '*'): Promise<string[]> {
    await this.ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => decodeURIComponent(f.replace(/\.json$/, '')))
      .filter((k) => regex.test(k));
  }
}
