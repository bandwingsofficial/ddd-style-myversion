// src/app.module.ts

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { RedisModule } from './infrastructure/redis/redis.module';

import { AuthModule } from './modules/auth/modules/auth.module';
import { CartModule } from './modules/cart/modules/cart.module';
import { CategoriesModule } from './modules/categories/modules/categories.module';
import { CheckoutModule } from './modules/checkout/modules/checkout.module';
import { DeliveryModule } from './modules/delivery/modules/delivery.module';
import { InventoryModule } from './modules/inventory/modules/inventory.module';
import { OrdersModule } from './modules/orders/modules/orders.module';
import { OutletsModule } from './modules/outlets/modules/outlets.module';
import { PaymentsModule } from './modules/payments/modules/payments.module';
import { ProductsModule } from './modules/products/modules/products.module';
import { SavedAddressModule } from './modules/saved-address/modules/saved-address.module';
import { StockItemsModule } from './modules/stock-items/modules/stock-items.module';
import { CustomersModule } from './modules/customers/modules/customers.module';

import { SmsProvider } from './infrastructure/providers/sms/sms.provider';
import { OtpWorker } from './workers/otp.worker';

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
    CartModule,
    OrdersModule,
    PaymentsModule,
    CheckoutModule,
    DeliveryModule,
    CustomersModule,
  ],
  providers: [OtpWorker, SmsProvider],
})
export class AppModule {}
