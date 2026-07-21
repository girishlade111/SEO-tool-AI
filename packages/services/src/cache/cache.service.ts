import type { SerializedError } from '@lade/config';

type CacheValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

interface CacheEntry {
  value: CacheValue;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export class CacheService {
  private readonly defaultTtl: number;

  constructor(defaultTtlSeconds = 300) {
    this.defaultTtl = defaultTtlSeconds;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: CacheValue, ttlSeconds?: number): Promise<void> {
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds ?? this.defaultTtl) * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    memoryCache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }

  async getOrSet<T = CacheValue>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value as CacheValue, ttlSeconds);
    return value;
  }

  buildKey(...parts: string[]): string {
    return `cache:${parts.join(':')}`;
  }
}

export const cacheService = new CacheService();
