import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CartService } from '../../cart/services/cart.service';
import { SavedAddressService } from '../../saved-address/services/saved-address.service';

import { OrderOrchestratorService } from '../../orders/services/order-orchestrator.service';
import { PaymentOrchestratorService } from '../../payments/services/payment-orchestrator.service';
import { OrderPendingService } from '../../orders/services/order-pending.service';

import { CartResponseMapper } from '../../cart/mappers/cart-response.mapper';

import { ValidationError } from '../../../common/errors';
import { traceOutletLifecycle } from '../../../common/utils/outlet-trace.util';

import { CheckoutEventsService } from '../events/checkout-events.service';

import { OrderStatus } from '@/modules/orders/domain/enums/order-status.enum';
import { Order } from '@/modules/orders/domain/models/order.model';
import { CheckoutStartResult } from '../types/checkout-start-response.types';
import { OutletService } from '../../outlets/services/outlet.service';
import { mapOrderCustomerDto } from '../../../common/utils/customer-display.util';
import { computeRemainingSeconds } from '../../orders/constants/order-pending.constants';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly savedAddressService: SavedAddressService,
    private readonly orderOrchestrator: OrderOrchestratorService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly orderPendingService: OrderPendingService,
    private readonly checkoutEvents: CheckoutEventsService,
    private readonly cartResponseMapper: CartResponseMapper,
    private readonly outletService: OutletService,
  ) {}

  private validateParams(params: {
    customerId: string;
    savedAddressId: string;
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

  async getCheckoutSummary(params: {
    customerId: string;
    outletId: string;
    savedAddressId: string;
  }) {
    this.validateParams(params);

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
      estimatedDeliveryMinutes: 25,
    };
  }

  /** @deprecated Use listPendingOrders — kept for backward compatibility */
  async getActiveCheckout(params: {
    customerId: string;
    outletId: string;
  }) {
    await this.orderPendingService.expirePendingOrdersForCustomer(
      params.customerId,
    );

    const order = await this.prisma.order.findFirst({
      where: {
        customerId: params.customerId,
        outletId: params.outletId,
        status: OrderStatus.PAYMENT_PENDING,
        paymentExpiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        currency: true,
        paymentExpiresAt: true,
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
      ...this.orderPendingService.buildTimerMeta(order.paymentExpiresAt),
    };
  }

  async listPendingOrders(customerId: string) {
    await this.orderPendingService.expirePendingOrdersForCustomer(customerId);

    const rows = await this.prisma.order.findMany({
      where: {
        customerId,
        status: OrderStatus.PAYMENT_PENDING,
        paymentExpiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return rows.map((row) => ({
      orderId: row.id,
      orderNumber: row.orderNumber ?? '',
      status: row.status,
      grandTotal: Number(row.grandTotal),
      currency: row.currency ?? 'INR',
      outletId: row.outletId,
      itemCount: row.itemCount,
      addressLabel: row.addressLabel,
      addressText: row.addressText,
      createdAt: row.createdAt.toISOString(),
      items: row.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice),
      })),
      ...this.orderPendingService.buildTimerMeta(row.paymentExpiresAt),
    }));
  }

  /**
   * Pay from checkout — always creates a NEW PAYMENT_PENDING order snapshot.
   * Cart remains editable until payment succeeds.
   */
  async startCheckout(params: {
    customerId: string;
    outletId: string;
    savedAddressId: string;
    orderNotes?: string;
    deliveryInstructions?: string;
  }): Promise<CheckoutStartResult> {
    this.validateParams(params);

    await this.orderPendingService.expirePendingOrdersForCustomer(
      params.customerId,
    );

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

        const address = await this.savedAddressService.getById(
          {
            customerId: params.customerId,
            savedAddressId: params.savedAddressId,
          },
          tx,
        );

        return this.orderOrchestrator.createOrderFromCart(
          {
            cart,
            address,
            orderNotes: params.orderNotes,
            deliveryInstructions: params.deliveryInstructions,
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

    return this.initiatePaymentForOrder(order, customerContact, false);
  }

  /** Retry payment on an existing PAYMENT_PENDING order (Pay Now). */
  async retryPayment(params: {
    customerId: string;
    orderId: string;
  }): Promise<CheckoutStartResult> {
    await this.orderPendingService.expirePendingOrdersForCustomer(
      params.customerId,
    );

    const order = await this.orderOrchestrator.getOrderById(params.orderId);

    if (order.customerId !== params.customerId) {
      throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
    }

    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      throw new ValidationError(
        'ORDER_NOT_PAYABLE',
        'This order is no longer awaiting payment',
      );
    }

    const remaining = computeRemainingSeconds(order.paymentExpiresAt);
    if (remaining <= 0) {
      await this.orderPendingService.expirePendingOrder(order.id);
      throw new ValidationError(
        'PAYMENT_WINDOW_EXPIRED',
        'Payment window has expired. Please place a new order.',
      );
    }

    const customerContact = await this.loadCustomerCheckoutContact(
      params.customerId,
    );

    return this.initiatePaymentForOrder(order, customerContact, true);
  }

  private async initiatePaymentForOrder(
    order: Order,
    customerContact: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
    },
    isRetry: boolean,
  ): Promise<CheckoutStartResult> {
    try {
      const paymentResult = await this.paymentOrchestrator.createPayment({
        orderId: order.id,
      });

      if (!isRetry) {
        this.checkoutEvents.emitCheckoutStarted({
          checkoutId: order.id,
          orderId: order.id,
          paymentId: paymentResult.payment.id,
          customerId: customerContact.customerId,
          grandTotal: order.grandTotal.toNumber(),
        });
      }

      return this.buildCheckoutStartResult({
        order,
        paymentId: paymentResult.payment.id,
        razorpayOrderId: paymentResult.razorpayOrderId,
        amountInPaise: paymentResult.amountInPaise,
        isRetry,
        customerContact,
      });
    } catch (err) {
      this.checkoutEvents.emitCheckoutFailed({
        customerId: customerContact.customerId,
        reason: err?.message ?? 'Payment failed',
      });

      throw err;
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

    const customerContact = mapOrderCustomerDto({
      id: customer.id,
      fullName: customer.profile?.fullName,
      phone: customer.phone,
      email: customer.profile?.email,
    });

    return {
      customerId: customer.id,
      customerName: customerContact.displayName,
      customerEmail: customerContact.email ?? '',
      customerPhone: customerContact.phone ?? '',
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
    const timer = this.orderPendingService.buildTimerMeta(
      order.paymentExpiresAt,
    );

    return {
      checkoutId: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: params.paymentId,
      razorpayOrderId: params.razorpayOrderId,
      amount: params.amountInPaise,
      razorpayAmount: params.amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      isRetry: params.isRetry,
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      deliveryFee: order.deliveryFee.toNumber(),
      grandTotal: order.grandTotal.toNumber(),
      paymentExpiresAt: timer.paymentExpiresAt,
      remainingSeconds: timer.remainingSeconds,
      ...customerContact,
    };
  }
}
