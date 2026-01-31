/* ================================================= */
/* STARTED                                           */
/* ================================================= */

export interface CheckoutStartedEvent {
  checkoutId: string; // optional future use
  orderId: string;
  paymentId: string;
  customerId: string;
  grandTotal: number;
}

/* ================================================= */
/* FAILED                                            */
/* ================================================= */

export interface CheckoutFailedEvent {
  customerId: string;
  reason: string;
}
