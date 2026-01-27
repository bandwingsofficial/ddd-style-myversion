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
    savedAddressId: string;
  }): Promise<CheckoutSummaryDto> {
    return this.checkoutService.getCheckoutSummary(params);
  }

  /* ================================================= */
  /* CHECKOUT – START PAYMENT                          */
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
    return this.checkoutService.startCheckout(params);
  }
}
