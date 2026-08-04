import { Injectable } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CheckoutSummaryDto } from '../mappers/checkout-summary.mapper';
import { CheckoutStartResult } from '../types/checkout-start-response.types';

@Injectable()
export class CheckoutOrchestratorService {
  constructor(private readonly checkoutService: CheckoutService) {}

  async getCheckoutSummary(params: {
    customerId: string;
    outletId: string;
    savedAddressId: string;
  }): Promise<CheckoutSummaryDto> {
    return this.checkoutService.getCheckoutSummary(params);
  }

  async getActiveCheckout(params: { customerId: string; outletId: string }) {
    return this.checkoutService.getActiveCheckout(params);
  }

  async listPendingOrders(customerId: string) {
    return this.checkoutService.listPendingOrders(customerId);
  }

  async startCheckout(params: {
    customerId: string;
    outletId: string;
    savedAddressId: string;
    orderNotes?: string;
    deliveryInstructions?: string;
  }): Promise<CheckoutStartResult> {
    return this.checkoutService.startCheckout(params);
  }

  async retryPayment(params: {
    customerId: string;
    orderId: string;
  }): Promise<CheckoutStartResult> {
    return this.checkoutService.retryPayment(params);
  }
}
