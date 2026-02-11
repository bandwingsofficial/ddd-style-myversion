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
  outletId: string; // 🔥 REQUIRED
  savedAddressId: string;
}): Promise<CheckoutSummaryDto> {
  return this.checkoutService.getCheckoutSummary(params);
}
  async startCheckout(params: {
  customerId: string;
  outletId: string;
  savedAddressId: string;
}): Promise<{
  orderId: string;
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  key: string;
}> {
  return this.checkoutService.startCheckout(params);
}
}