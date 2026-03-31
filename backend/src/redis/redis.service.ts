import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || '127.0.0.1',
      port: parseInt(
        this.configService.get<string>('REDIS_PORT') || '6379',
        10,
      ),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      db: 0,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) {
      return cached;
    }

    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      const cachedAgain = await this.getJson<T>(key);
      if (cachedAgain !== null) {
        return cachedAgain;
      }

      const result = await fn();
      if (result !== undefined && result !== null) {
        await this.setJson(key, result, this.withJitter(ttl));
      }

      return result;
    })();

    this.inFlight.set(key, promise);

    try {
      return await promise;
    } finally {
      this.inFlight.delete(key);
    }
  }

  async delByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100',
      );

      if (keys.length > 0) {
        deleted += await this.client.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');

    return deleted;
  }

  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    const result = await this.client.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<number> {
    return this.client.del(key);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }

    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttl: number): Promise<number> {
    return this.client.expire(key, ttl);
  }

  async setJson(key: string, value: unknown, ttl?: number): Promise<'OK'> {
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async tryLockReview(
    sessionId: string,
    userId: string,
    username: string,
  ): Promise<{ success: boolean; owner?: string }> {
    const key = `review:lock:${sessionId}`;
    const value = JSON.stringify({ userId, username, time: Date.now() });
    const result = await this.client.set(key, value, 'EX', 900, 'NX');

    if (result === 'OK') {
      return { success: true };
    }

    const currentOwner = await this.getJson<{ username: string }>(key);
    return { success: false, owner: currentOwner?.username };
  }

  async unlockReview(sessionId: string, userId: string): Promise<void> {
    const key = `review:lock:${sessionId}`;
    const current = await this.getJson<{ userId: string }>(key);
    if (current?.userId === userId) {
      await this.client.del(key);
    }
  }

  private withJitter(ttl: number) {
    if (ttl <= 0) {
      return ttl;
    }

    const jitter = Math.max(1, Math.round(ttl * 0.1));
    return ttl + Math.floor(Math.random() * jitter);
  }
}
