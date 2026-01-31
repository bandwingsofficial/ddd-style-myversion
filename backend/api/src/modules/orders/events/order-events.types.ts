/* ================================================= */
/* BASE                                              */
/* ================================================= */

export interface OrderBaseEvent {
  orderId: string;
  customerId: string;
  status: string;
  occurredAt: Date;
}

/* ================================================= */
/* PAYMENT                                           */
/* ================================================= */

export interface OrderPaidEvent extends OrderBaseEvent {
  amount: number;
}

/* ================================================= */
/* DELIVERY                                          */
/* ================================================= */

export interface OrderDeliveryEvent extends OrderBaseEvent {}
