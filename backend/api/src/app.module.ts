// src/app.module.ts

import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';

import { AuthModule } from './modules/auth/modules/auth.module';
import { OutletsModule } from './modules/outlets/modules/outlets.module';
import { CategoriesModule } from './modules/categories/modules/categories.module';
import { StockItemsModule } from './modules/stock-items/modules/stock-items.module';
import { InventoryModule } from './modules/inventory/modules/inventory.module';
import { ProductsModule } from './modules/products/modules/products.module';


import { OtpWorker } from './workers/otp.worker';
import { SmsProvider } from './infrastructure/providers/sms.provider';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule, // ⬅️ brings queue + QueueService
    EventEmitterModule.forRoot(),
    AuthModule,
    OutletsModule,
    CategoriesModule,
    StockItemsModule,
    InventoryModule,
    ProductsModule,
  ],
  providers: [
    OtpWorker,
    SmsProvider,
  ],
})
export class AppModule {}
