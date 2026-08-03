import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CartService } from '../../cart/services/cart.service';
import { SavedAddressService } from '../../saved-address/services/saved-address.service';

import { OrderOrchestratorService } from '../../orders/services/order-orchestrator.service';
import { PaymentOrchestratorService } from '../../payments/services/payment-orchestrator.service';

import { CheckoutPricingService } from './checkout-pricing.service';

import { CartResponseMapper } from '../../cart/mappers/cart-response.mapper';

import { ValidationError } from '../../../common/errors';
import { traceOutletLifecycle } from '../../../common/utils/outlet-trace.util';

/* 🔥 NEW */
import { CheckoutEventsService } from '../events/checkout-events.service';
import { CartStatus } from '@/modules/cart/domain/enums/cart-status.enum';

import { OrderStatus } from '@/modules/orders/domain/enums/order-status.enum';
import { Order } from '@/modules/orders/domain/models/order.model';
import { CheckoutStartResult } from '../types/checkout-start-response.types';
import { OutletService } from '../../outlets/services/outlet.service';

/* ============================================= */
/* ACTIVE ORDER GUARD                             */
/* Only 1 active order per outlet allowed          */
/* ============================================= */

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
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
    private readonly cartResponseMapper: CartResponseMapper,
    private readonly outletService: OutletService,
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

  private assertAddressResolvedOutlet(
    address: {
      resolvedOutletId?: string | null;
      resolvedOutletName?: string | null;
      serviceable?: boolean;
    },
    requestedOutletId: string,
    requestedOutletName?: string | null,
  ): void {
    if (!address.serviceable || !address.resolvedOutletId) {
      throw new ValidationError(
        'ADDRESS_OUT_OF_SERVICE',
        'Your selected delivery address is outside our delivery area. Please choose another address.',
      );
    }

    if (address.resolvedOutletId !== requestedOutletId) {
      const addressOutlet = address.resolvedOutletName ?? 'another outlet';
      const cartOutlet = requestedOutletName ?? 'your current outlet';

      throw new ValidationError(
        'ADDRESS_OUTLET_MISMATCH',
        `This address is outside the delivery area of your selected outlet. Available delivery outlet: ${addressOutlet}. Your cart is from: ${cartOutlet}.`,
        {
          addressOutletId: address.resolvedOutletId,
          addressOutletName: address.resolvedOutletName,
          cartOutletId: requestedOutletId,
          cartOutletName: requestedOutletName,
        },
      );
    }
  }

  private assertCartOutletMatch(
    cartOutletId: string | undefined,
    requestedOutletId: string,
    stage: string,
  ): void {
    if (!cartOutletId) {
      throw new ValidationError(
        'OUTLET_CART_MISMATCH',
        'Cart does not belong to any outlet',
      );
    }

    if (cartOutletId !== requestedOutletId) {
      traceOutletLifecycle(stage, {
        requestedOutletId,
        cartOutletId,
      });
      throw new ValidationError(
        'OUTLET_CART_MISMATCH',
        'Cart does not belong to the requested outlet',
      );
    }
  }

  private async resolveOutletName(outletId: string): Promise<string | null> {
    const outlet = await this.outletService.getById(outletId);
    return outlet?.name ?? null;
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

    this.assertCartOutletMatch(
      cart.outletId,
      params.outletId,
      'checkout.summary',
    );

    const address = await this.savedAddressService.getById({
      customerId: params.customerId,
      savedAddressId: params.savedAddressId,
    });

    const requestedOutletName = await this.resolveOutletName(params.outletId);
    this.assertAddressResolvedOutlet(
      address,
      params.outletId,
      requestedOutletName,
    );

    const cartResponse = await this.cartResponseMapper.toResponse(cart);

    if (!cartResponse) {
      throw new ValidationError('EMPTY_CART', 'Cart is empty');
    }

    return {
      address: {
        id: address.id,
        label: address.label,
        addressText: address.addressText,
        latitude: address.latitude ?? undefined,
        longitude: address.longitude ?? undefined,
      },
      items: cartResponse.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPrice: item.discountPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: cartResponse.subtotal,
      discount: cartResponse.discount,
      netSubtotal: cartResponse.netSubtotal,
      afterDiscountTotal: cartResponse.afterDiscountTotal,
      deliveryFee: cartResponse.deliveryFee,
      grandTotal: cartResponse.grandTotal,
      itemCount: cartResponse.itemCount,
      deliveryRuleId: cartResponse.deliveryRuleId,
      deliveryRuleName: cartResponse.deliveryRuleName,
      matchedDeliveryRuleId: cartResponse.matchedDeliveryRuleId,
      matchedDeliveryRuleName: cartResponse.matchedDeliveryRuleName,
      minimumOrderAmount: cartResponse.minimumOrderAmount,
      isFreeDelivery: cartResponse.isFreeDelivery,
      freeDeliveryThreshold: cartResponse.freeDeliveryThreshold,
      remainingForFreeDelivery: cartResponse.remainingForFreeDelivery,
      amountToFreeDelivery: cartResponse.amountToFreeDelivery,
      remainingAmountForFreeDelivery:
        cartResponse.remainingAmountForFreeDelivery,
      remainingAmountForNextRule: cartResponse.remainingAmountForNextRule,
      currency: cartResponse.currency,
    };
  }

  async getActiveCheckout(params: {
    customerId: string;
    outletId: string;
  }): Promise<{
    orderId: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    currency: string;
  } | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        customerId: params.customerId,
        outletId: params.outletId,
        status: OrderStatus.PAYMENT_PENDING,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        currency: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber ?? '',
      status: order.status,
      grandTotal: Number(order.grandTotal),
      currency: order.currency ?? 'INR',
    };
  }

  /* ================================================= */
  /* START CHECKOUT (GATEWAY STYLE)                    */
  /* ================================================= */

  async startCheckout(params: {
    customerId: string;
    outletId: string;
    savedAddressId: string;
  }): Promise<CheckoutStartResult> {
    this.validateParams(params);

    const checkoutAddress = await this.savedAddressService.getById({
      customerId: params.customerId,
      savedAddressId: params.savedAddressId,
    });

    const requestedOutletName = await this.resolveOutletName(params.outletId);
    this.assertAddressResolvedOutlet(
      checkoutAddress,
      params.outletId,
      requestedOutletName,
    );

    const customerContact = await this.loadCustomerCheckoutContact(
      params.customerId,
    );

    const pendingOrder = await this.prisma.order.findFirst({
      where: {
        customerId: params.customerId,
        outletId: params.outletId,
        status: OrderStatus.PAYMENT_PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingOrder) {
      const cart = await this.cartService.getActiveCart({
        customerId: params.customerId,
        outletId: params.outletId,
      });

      if (!cart || !cart.hasItems()) {
        throw new ValidationError('EMPTY_CART', 'Cart is empty');
      }

      this.assertCartOutletMatch(
        cart.outletId,
        params.outletId,
        'checkout.startCheckout.pending',
      );

      const address = await this.savedAddressService.getById({
        customerId: params.customerId,
        savedAddressId: params.savedAddressId,
      });

      const syncedOrder =
        await this.orderOrchestrator.resyncPendingOrderFromCart({
          orderId: pendingOrder.id,
          cart,
          address,
        });

      const paymentResult = await this.paymentOrchestrator.createPayment({
        orderId: syncedOrder.id,
      });

      return this.buildCheckoutStartResult({
        order: syncedOrder,
        paymentId: paymentResult.payment.id,
        razorpayOrderId: paymentResult.razorpayOrderId,
        amountInPaise: paymentResult.amountInPaise,
        isRetry: true,
        customerContact,
      });
    }

    const order = await this.prisma.$transaction(
      async (tx: PrismaTransaction) => {
        const cart = await this.cartService.getActiveCart(
          {
            customerId: params.customerId,
            outletId: params.outletId,
          },
          tx,
        );

        if (!cart || !cart.hasItems()) {
          throw new ValidationError('EMPTY_CART', 'Cart is empty');
        }

        this.assertCartOutletMatch(
          cart.outletId,
          params.outletId,
          'checkout.startCheckout.create',
        );

        await this.ensureNoActiveOrder(params.customerId, params.outletId, tx);

        if (cart.status === CartStatus.LOCKED) {
          throw new ValidationError(
            'CHECKOUT_ALREADY_IN_PROGRESS',
            'Checkout already started for this cart',
          );
        }

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

        return this.orderOrchestrator.createOrderFromCart(
          {
            cart: lockedCart,
            address,
          },
          tx,
        );
      },
    );

    traceOutletLifecycle('checkout.startCheckout.orderCreated', {
      requestedOutletId: params.outletId,
      orderOutletId: order.outletId,
      orderId: order.id,
      customerId: params.customerId,
    });

    /* ================================================= */
    /* 2️⃣ CREATE PAYMENT SESSION                         */
    /* ================================================= */

    try {
      const paymentResult = await this.paymentOrchestrator.createPayment({
        orderId: order.id,
      });

      this.checkoutEvents.emitCheckoutStarted({
        checkoutId: order.id,
        orderId: order.id,
        paymentId: paymentResult.payment.id,
        customerId: params.customerId,
        grandTotal: order.grandTotal.toNumber(),
      });

      /* ================================================= */
      /* 🔥 RETURN RAZORPAY DATA TO FRONTEND               */
      /* ================================================= */

      return this.buildCheckoutStartResult({
        order,
        paymentId: paymentResult.payment.id,
        razorpayOrderId: paymentResult.razorpayOrderId,
        amountInPaise: paymentResult.amountInPaise,
        isRetry: false,
        customerContact,
      });
    } catch (err) {
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
      const fullOrder = await this.prisma.order.findUnique({
        where: { id: activeOrder.id },
        select: { id: true, orderNumber: true },
      });

      throw new ValidationError(
        'ORDER_ALREADY_IN_PROGRESS',
        'You already have an order in progress.',
        {
          orderId: activeOrder.id,
          orderNumber: fullOrder?.orderNumber ?? null,
        },
      );
    }
  }

  private async loadCustomerCheckoutContact(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { profile: true },
    });

    if (!customer) {
      throw new ValidationError('CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    return {
      customerId: customer.id,
      customerName: customer.profile?.fullName?.trim() || 'Customer',
      customerEmail: customer.profile?.email?.trim() || '',
      customerPhone: customer.phone?.trim() || '',
    };
  }

  private buildCheckoutStartResult(params: {
    order: Order;
    paymentId: string;
    razorpayOrderId: string;
    amountInPaise: number;
    isRetry: boolean;
    customerContact: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
    };
  }): CheckoutStartResult {
    const { order, customerContact } = params;
    const subtotal = order.subtotal.toNumber();
    const discount = order.discount.toNumber();
    const deliveryFee = order.deliveryFee.toNumber();
    const grandTotal = order.grandTotal.toNumber();
    const amountInPaise = params.amountInPaise;

    console.log('[Checkout Razorpay Session]', {
      customerId: customerContact.customerId,
      customerName: customerContact.customerName,
      customerEmail: customerContact.customerEmail,
      customerPhone: customerContact.customerPhone,
      checkoutId: order.id,
      subtotal,
      discount,
      deliveryFee,
      grandTotal,
      razorpayAmount: amountInPaise,
      isRetry: params.isRetry,
    });

    return {
      checkoutId: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: params.paymentId,
      razorpayOrderId: params.razorpayOrderId,
      amount: amountInPaise,
      razorpayAmount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      isRetry: params.isRetry,
      subtotal,
      discount,
      deliveryFee,
      grandTotal,
      ...customerContact,
    };
  }
}
