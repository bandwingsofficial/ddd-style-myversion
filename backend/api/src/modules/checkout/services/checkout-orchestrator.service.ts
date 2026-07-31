import { Injectable } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CheckoutSummaryDto } from '../mappers/checkout-summary.mapper';

@Injectable()
export class CheckoutOrchestratorService {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) {}

  /* ================================================= */
  /* CHECKOUT – SUMMARY (PREVIEW PAGE)                 */
  /* ================================================= */

async getCheckoutSummary(params: {
  customerId: string;
  outletId: string;
  savedAddressId: string;
}): Promise<CheckoutSummaryDto> {
  return this.checkoutService.getCheckoutSummary(params);
}

async getActiveCheckout(params: {
  customerId: string;
  outletId: string;
}) {
  return this.checkoutService.getActiveCheckout(params);
}

async startCheckout(params: {
  customerId: string;
  outletId: string;
  savedAddressId: string;
}): Promise<{
  orderId: string;
  orderNumber: string;
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  isRetry: boolean;
}> {
  return this.checkoutService.startCheckout(params);
}
}