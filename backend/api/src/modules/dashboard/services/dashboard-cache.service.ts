import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { RedisService } from '../../../infrastructure/redis/redis.service';
import { DashboardFilter } from '../domain/types/dashboard-filter.types';

@Injectable()
export class DashboardCacheService {
  private readonly defaultTtlSeconds = 60;

  constructor(private readonly redis: RedisService) {}

  private buildKey(
    prefix: string,
    filter: DashboardFilter,
    suffix = '',
  ): string {
    const payload = JSON.stringify({ ...filter, suffix });
    const hash = createHash('sha256').update(payload).digest('hex');
    return `dashboard:${prefix}:${hash}`;
  }

  async get<T>(
    prefix: string,
    filter: DashboardFilter,
    suffix = '',
  ): Promise<T | null> {
    const key = this.buildKey(prefix, filter, suffix);
    const cached = await this.redis.get(key);
    if (!cached) return null;

    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  async set<T>(
    prefix: string,
    filter: DashboardFilter,
    value: T,
    ttlSeconds = this.defaultTtlSeconds,
    suffix = '',
  ): Promise<void> {
    const key = this.buildKey(prefix, filter, suffix);
    await this.redis.set(key, JSON.stringify(value), ttlSeconds);
  }

  async invalidateAll(): Promise<void> {
    // Lightweight strategy: dashboard cache keys expire naturally.
  }
}
