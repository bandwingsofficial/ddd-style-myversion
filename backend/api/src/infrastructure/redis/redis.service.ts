import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;

  constructor(private readonly config: ConfigService) {
    // 🔥 Redis MUST be created immediately (Bull requirement)
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST'),
      port: this.config.get<number>('REDIS_PORT'),
      password: this.config.get<string>('REDIS_PASSWORD'),
      db: this.config.get<number>('REDIS_DB') ?? 0,
      lazyConnect: false,           // ⭐ DO NOT delay connection
      maxRetriesPerRequest: null,   // ⭐ REQUIRED for Bull
    });

    this.client.on('error', (err) => {
      console.error('[Redis] Error:', err);
    });
  }

  /* ================================================= */
  /* BULL SUPPORT                                      */
  /* ================================================= */

  /**
   * Primary Redis client
   */
  getClient(): RedisClient {
    return this.client;
  }

  /**
   * Duplicate connection for Bull workers
   */
  duplicate(): RedisClient {
    return this.client.duplicate();
  }

  /* ================================================= */
  /* BASIC OPERATIONS                                 */
  /* ================================================= */

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /* ================================================= */
  /* COUNTERS / RATE LIMIT                            */
  /* ================================================= */

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /* ================================================= */
  /* ADVANCED                                         */
  /* ================================================= */

  async getTtl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<boolean> {
    const result = ttlSeconds
      ? await this.client.set(key, value, 'EX', ttlSeconds, 'NX')
      : await this.client.set(key, value, 'NX');

    return result === 'OK';
  }

  /* ================================================= */
  /* SHUTDOWN                                         */
  /* ================================================= */

  async onModuleDestroy() {
    await this.client.quit();
  }
}
