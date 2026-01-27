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

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly savedAddressService: SavedAddressService,
    private readonly pricingService: CheckoutPricingService,
    private readonly orderOrchestrator: OrderOrchestratorService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
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
      throw new ValidationError('CUSTOMER_ID_REQUIRED', 'Customer id is required');
    }

    if (!params?.savedAddressId) {
      throw new ValidationError('ADDRESS_ID_REQUIRED', 'Saved address id is required');
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
    savedAddressId: string;
    deliveryFee?: number;
  }) {
    this.validateParams(params);

    const cart = await this.cartService.getActiveCart({
      customerId: params.customerId,
    });

    if (!cart || !cart.items.length) {
      throw new ValidationError('EMPTY_CART', 'Cart is empty');
    }

    const address = await this.savedAddressService.getById({
      customerId: params.customerId,
      savedAddressId: params.savedAddressId,
    });

    /* ✅ IMPORTANT:
       Summary is READ-ONLY snapshot.
       No pricing, no recalculation.
       Just mirror cart exactly.
    */
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
    savedAddressId: string;
    deliveryFee?: number;
  }): Promise<{
    orderId: string;
    paymentId: string;
    checkoutUrl: string;
  }> {
    this.validateParams(params);

    /* ================================================= */
    /* PHASE 1 — DB ONLY (atomic transaction)             */
    /* ================================================= */

    const order = await this.prisma.$transaction(
      async (tx: PrismaTransaction) => {

        /* ---------- get cart ---------- */
        const cart = await this.cartService.getActiveCart(
          { customerId: params.customerId },
          tx,
        );

        if (!cart || !cart.items.length) {
          throw new ValidationError('EMPTY_CART', 'Cart is empty');
        }

        /* ---------- lock cart snapshot ---------- */
        const lockedCart = await this.cartService.lockCart(
          { customerId: params.customerId },
          tx,
        );

        /* ---------- address ---------- */
        const address = await this.savedAddressService.getById({
          customerId: params.customerId,
          savedAddressId: params.savedAddressId,
        });

        /* ---------- pricing (allowed here only) ---------- */
        const pricing = this.pricingService.calculate({
          cart: lockedCart,
          deliveryFee: params.deliveryFee ?? 0,
        });

        /* ---------- create order snapshot ---------- */
        return this.orderOrchestrator.createOrderFromCart(
          {
            cart: lockedCart,
            address,
            deliveryFee: pricing.deliveryFee,
          },
          tx,
        );
      },
    );

    /* ================================================= */
    /* PHASE 2 — PAYMENT (outside transaction)            */
    /* ================================================= */

    const paymentResult =
      await this.paymentOrchestrator.createPayment({
        orderId: order.id,
      });

    return {
      orderId: order.id,
      paymentId: paymentResult.payment.id,
      checkoutUrl: paymentResult.checkoutUrl,
    };
  }
}
