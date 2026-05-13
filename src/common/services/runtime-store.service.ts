import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

type MemoryEntry = { value: string; expiresAt?: number };
type MemoryListEntry = { values: string[]; expiresAt?: number };

@Injectable()
export class RuntimeStoreService implements OnModuleDestroy {
  private readonly redisUrl = process.env.REDIS_URL;
  private readonly memory = new Map<string, MemoryEntry>();
  private readonly memoryLists = new Map<string, MemoryListEntry>();
  private readonly redis = this.redisUrl
    ? new Redis(this.redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
      })
    : null;
  private redisHealthy = Boolean(this.redisUrl);

  constructor() {
    this.redis?.on('error', () => {
      this.redisHealthy = false;
    });
    this.redis?.on('ready', () => {
      this.redisHealthy = true;
    });
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (this.redis && this.redisHealthy) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, value);
        }
        return;
      } catch {
        this.redisHealthy = false;
      }
    }

    this.memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async get(key: string) {
    if (this.redis && this.redisHealthy) {
      try {
        return await this.redis.get(key);
      } catch {
        this.redisHealthy = false;
      }
    }
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string) {
    if (this.redis && this.redisHealthy) {
      try {
        await this.redis.del(key);
        return;
      } catch {
        this.redisHealthy = false;
      }
    }
    this.memory.delete(key);
  }

  async incr(key: string) {
    if (this.redis && this.redisHealthy) {
      try {
        return await this.redis.incr(key);
      } catch {
        this.redisHealthy = false;
      }
    }
    const existing = await this.get(key);
    const next = Number(existing ?? '0') + 1;
    this.memory.set(key, { value: String(next) });
    return next;
  }

  async expire(key: string, ttlSeconds: number) {
    if (this.redis && this.redisHealthy) {
      try {
        await this.redis.expire(key, ttlSeconds);
        return;
      } catch {
        this.redisHealthy = false;
      }
    }
    const entry = this.memory.get(key);
    if (!entry) return;
    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    this.memory.set(key, entry);
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }

  async lpush(key: string, value: string, ttlSeconds?: number) {
    if (this.redis && this.redisHealthy) {
      try {
        await this.redis.lpush(key, value);
        if (ttlSeconds) {
          await this.redis.expire(key, ttlSeconds);
        }
        return;
      } catch {
        this.redisHealthy = false;
      }
    }

    const existing = this.memoryLists.get(key);
    const values = existing?.values ?? [];
    values.unshift(value);
    this.memoryLists.set(key, {
      values,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : existing?.expiresAt,
    });
  }

  async lrange(key: string, start: number, stop: number) {
    if (this.redis && this.redisHealthy) {
      try {
        return await this.redis.lrange(key, start, stop);
      } catch {
        this.redisHealthy = false;
      }
    }

    const entry = this.memoryLists.get(key);
    if (!entry) return [];
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.memoryLists.delete(key);
      return [];
    }

    const end = stop < 0 ? entry.values.length : stop + 1;
    return entry.values.slice(start, end);
  }
}
