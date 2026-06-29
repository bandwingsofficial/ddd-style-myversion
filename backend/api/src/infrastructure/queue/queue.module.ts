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
  redis: config.getOrThrow<string>('REDIS_URL'),
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
