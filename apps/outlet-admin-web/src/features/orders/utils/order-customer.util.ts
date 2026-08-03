import { Order, OrderCustomer } from '../types';

export function normalizeOrderCustomer(order: Order): OrderCustomer {
  if (order.customer?.id) {
    return order.customer;
  }

  return {
    id: order.customerId ?? '',
    fullName: order.customerFullName ?? null,
    phone: order.customerPhone ?? null,
    email: order.customerEmail ?? null,
  };
}

export function attachOrderCustomer(order: Order): Order {
  const customer = normalizeOrderCustomer(order);

  return {
    ...order,
    customer,
    customerPhone: customer.phone,
    customerEmail: customer.email,
  };
}
