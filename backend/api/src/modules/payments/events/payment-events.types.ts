/* ================================================= */
/* COMMON                                            */
/* ================================================= */

export interface PaymentBaseEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  occurredAt: Date;
}

export type PaymentSocketEvent =
  | PaymentInitiatedEvent
  | PaymentSuccessEvent
  | PaymentFailedEvent
  | PaymentRefundedEvent;


/* ================================================= */
/* INITIATED                                         */
/* ================================================= */

export interface PaymentInitiatedEvent
  extends PaymentBaseEvent {}

/* ================================================= */
/* SUCCESS                                           */
/* ================================================= */

export interface PaymentSuccessEvent
  extends PaymentBaseEvent {
  transactionId: string;
}

/* ================================================= */
/* FAILED                                            */
/* ================================================= */

export interface PaymentFailedEvent
  extends PaymentBaseEvent {
  reason?: string;
}

/* ================================================= */
/* REFUNDED                                          */
/* ================================================= */

export interface PaymentRefundedEvent
  extends PaymentBaseEvent {}
