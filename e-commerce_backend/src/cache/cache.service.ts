import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisCache } from 'cache-manager-redis-yet';
import { RedisClientType } from 'redis';

@Injectable()
export class AppCacheService {
  private readonly logger = new Logger(AppCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // ─── Basic ops ────────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    return (await this.cache.get<T>(key)) ?? null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    // cache-manager v5: ttl is in milliseconds
    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : undefined;
    await this.cache.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async reset(): Promise<void> {
    await this.cache.reset();
  }

  // ─── Prefix invalidation ─────────────────────────────────────────────────

  /**
   * Delete all keys matching a prefix pattern via Redis SCAN.
   * No-op when the underlying store is not Redis.
   */
  async invalidatePrefix(prefix: string): Promise<number> {
    try {
      const redisCache = this.cache as RedisCache;
      const client = redisCache?.store?.client as RedisClientType | undefined;

      if (!client) {
        this.logger.warn('Redis client unavailable; skipping prefix invalidation');
        return 0;
      }

      let deleted = 0;
      let cursor = 0;
      const pattern = `${prefix}*`;

      do {
        const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await client.del(result.keys);
          deleted += result.keys.length;
        }
      } while (cursor !== 0);

      this.logger.debug(`Invalidated ${deleted} keys with prefix "${prefix}"`);
      return deleted;
    } catch (err) {
      this.logger.error(`Prefix invalidation failed for "${prefix}"`, (err as Error).message);
      return 0;
    }
  }

  // ─── Convenience wrappers ─────────────────────────────────────────────────

  /** Read-through: return cache hit or call loader and cache the result. */
  async wrap<T>(key: string, loader: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /** Invalidate a set of exact keys. */
  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.del(k)));
  }
}
