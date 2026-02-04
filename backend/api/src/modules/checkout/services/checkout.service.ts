import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CartService } from '../../cart/services/cart.service';
import { SavedAddressService } from '../../saved-address/services/saved-address.service';

import { OrderOrchestratorService } from '../../orders/services/order-orchestrator.service';
import { PaymentOrchestratorService } from '../../payments/services/payment-orchestrator.service';

import { CheckoutPricingService } from './checkout-pricing.service';

import { CheckoutSummaryMapper } from '../mappers/checkout-summary.mapper';

import { ValidationError } from '../../../common/errors';

/* 🔥 NEW */
import { CheckoutEventsService } from '../events/checkout-events.service';
import { CartStatus } from '@/modules/cart/domain/enums/cart-status.enum';

import { OrderStatus } from '@/modules/orders/domain/enums/order-status.enum';

/* ============================================= */
/* ACTIVE ORDER GUARD                             */
/* Only 1 active order per outlet allowed          */
/* ============================================= */

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
];

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly savedAddressService: SavedAddressService,
    private readonly pricingService: CheckoutPricingService,
    private readonly orderOrchestrator: OrderOrchestratorService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,

    /* 🔥 NEW */
    private readonly checkoutEvents: CheckoutEventsService,
  ) {}

  /* ================================================= */
  /* 🔒 COMMON VALIDATION                              */
  /* ================================================= */

  private validateParams(params: {
    customerId: string;
    savedAddressId: string;
    deliveryFee?: number;
  }) {
    if (!params?.customerId) {
      throw new ValidationError(
        'CUSTOMER_ID_REQUIRED',
        'Customer id is required',
      );
    }

    if (!params?.savedAddressId) {
      throw new ValidationError(
        'ADDRESS_ID_REQUIRED',
        'Saved address id is required',
      );
    }

    if ((params.deliveryFee ?? 0) < 0) {
      throw new ValidationError(
        'INVALID_DELIVERY_FEE',
        'Delivery fee cannot be negative',
      );
    }
  }

  /* ================================================= */
  /* GET CHECKOUT SUMMARY                              */
  /* ================================================= */

async getCheckoutSummary(params: {
  customerId: string;
  outletId: string; // 🔥 REQUIRED
  savedAddressId: string;
}) {
  this.validateParams(params);

  /* 🔥 outlet-aware cart fetch */
  const cart = await this.cartService.getActiveCart({
    customerId: params.customerId,
    outletId: params.outletId,
  });

  if (!cart || !cart.hasItems()) {
    throw new ValidationError('EMPTY_CART', 'Cart is empty');
  }

  const address = await this.savedAddressService.getById({
    customerId: params.customerId,
    savedAddressId: params.savedAddressId,
  });

  return CheckoutSummaryMapper.toDto({
    cart,
    address,
  });
}

  /* ================================================= */
  /* START CHECKOUT (TX SAFE + PRODUCTION READY)        */
  /* ================================================= */

  async startCheckout(params: {
  customerId: string;
  outletId: string;
  savedAddressId: string;
}): Promise<{
  orderId: string;
  paymentId: string;
  checkoutUrl: string;
}> {

  console.log('\n==============================');
  console.log('🚀 CHECKOUT STARTED');
  console.log(params);
  console.log('==============================\n');

  this.validateParams(params);

  const order = await this.prisma.$transaction(
    async (tx: PrismaTransaction) => {

      console.log('🛒 Fetching active cart...');

      const cart = await this.cartService.getActiveCart(
        {
          customerId: params.customerId,
          outletId: params.outletId,
        },
        tx,
      );

      if (!cart || !cart.hasItems()) {
        console.log('❌ Cart empty');
        throw new ValidationError('EMPTY_CART', 'Cart is empty');
      }

      console.log('✅ Cart found with items');

      await this.ensureNoActiveOrder(
        params.customerId,
        params.outletId,
        tx,
      );

      if (cart.status === CartStatus.LOCKED) {
        console.log('❌ Cart already locked');
        throw new ValidationError(
          'CHECKOUT_ALREADY_IN_PROGRESS',
          'Checkout already started for this cart',
        );
      }

      console.log('🔒 Locking cart...');

      const lockedCart = await this.cartService.lockCart(
        {
          customerId: params.customerId,
          outletId: params.outletId,
        },
        tx,
      );

      const address = await this.savedAddressService.getById(
        {
          customerId: params.customerId,
          savedAddressId: params.savedAddressId,
        },
        tx,
      );

      console.log('📦 Creating order from cart...');

      const createdOrder =
        await this.orderOrchestrator.createOrderFromCart(
          {
            cart: lockedCart,
            address,
          },
          tx,
        );

      console.log('✅ ORDER CREATED:', createdOrder.id);

      return createdOrder;
    },
  );

  try {

    console.log('\n💳 Creating payment session...');

    const paymentResult = await this.paymentOrchestrator.createPayment({
      orderId: order.id,
    });

    console.log('🟡 PAYMENT SESSION CREATED (ORDER → PAYMENT_PENDING)');
    console.log({
      orderId: order.id,
      paymentId: paymentResult.payment.id,
    });

    this.checkoutEvents.emitCheckoutStarted({
      checkoutId: order.id,
      orderId: order.id,
      paymentId: paymentResult.payment.id,
      customerId: params.customerId,
      grandTotal: order.grandTotal.toNumber(),
    });

    console.log('✅ Checkout ready\n');

    return {
      orderId: order.id,
      paymentId: paymentResult.payment.id,
      checkoutUrl: paymentResult.checkoutUrl,
    };

  } catch (err) {

    console.log('❌ PAYMENT CREATION FAILED → unlocking cart');
    console.error(err);

    await this.cartService.unlockCart({
      customerId: params.customerId,
      outletId: params.outletId,
    });

    this.checkoutEvents.emitCheckoutFailed({
      customerId: params.customerId,
      reason: err?.message ?? 'Payment failed',
    });

    throw err;
  }
}
  private async ensureNoActiveOrder(
    customerId: string,
    outletId: string,
    tx?: PrismaTransaction,
  ) {
    const prisma = tx ?? this.prisma;

    const activeOrder = await prisma.order.findFirst({
      where: {
        customerId,
        outletId,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
      select: {
        id: true,
      },
    });

    if (activeOrder) {
      throw new ValidationError(
        'ORDER_ALREADY_IN_PROGRESS',
        'You already have an order in progress.',
        {
          orderId: activeOrder.id, // ⭐ frontend uses this
        },
      );
    }
  }

}
