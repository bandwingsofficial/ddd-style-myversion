// src/infrastructure/redis/redis.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule, // needed for ConfigService inside RedisService
  ],
  providers: [RedisService],
  exports: [RedisService], // 👈 required for AuthModule, others
})
export class RedisModule {}
