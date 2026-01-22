// src/app.module.ts

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
import { SavedAddressModule } from './modules/saved-address/modules/saved-address.module';

import { OtpWorker } from './workers/otp.worker';
import { SmsProvider } from './infrastructure/providers/sms.provider';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule,

    // 🔥 CRITICAL FIX — ENABLE WILDCARDS
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    AuthModule,
    OutletsModule,
    CategoriesModule,
    StockItemsModule,
    InventoryModule,
    ProductsModule,
    SavedAddressModule,
  ],
  providers: [
    OtpWorker,
    SmsProvider,
  ],
})
export class AppModule {}
