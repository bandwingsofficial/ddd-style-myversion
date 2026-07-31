import { Injectable } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CheckoutSummaryDto } from '../mappers/checkout-summary.mapper';
import { CheckoutStartResult } from '../types/checkout-start-response.types';

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
}): Promise<CheckoutStartResult> {
  return this.checkoutService.startCheckout(params);
}
}