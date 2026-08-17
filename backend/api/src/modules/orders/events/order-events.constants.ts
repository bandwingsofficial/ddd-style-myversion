export const OrderEvents = {
  ORDER_CREATED: 'order.created',

  ORDER_PAYMENT_PENDING: 'order.payment_pending',
  ORDER_PAID: 'order.paid',

  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_PREPARING: 'order.preparing',
  ORDER_READY_TO_DISPATCH: 'order.ready_to_dispatch',
  ORDER_OUT_FOR_DELIVERY: 'order.out_for_delivery',

  ORDER_DELIVERED: 'order.delivered',

  ORDER_CANCELLED: 'order.cancelled',
  ORDER_FAILED: 'order.failed',
} as const;
