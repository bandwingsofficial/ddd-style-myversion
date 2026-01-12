// src/infrastructure/queue/queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QueueService } from './queue.service';
import { OTP_QUEUE } from './queues/otp.queue';

@Module({
  imports: [
    ConfigModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB') ?? 0,
        },
      }),
    }),

    BullModule.registerQueue({
      name: OTP_QUEUE,
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
