import { Order } from '../types';

/** Matches backend OrderStatus enum. */
export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;

export type BackendOrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Board section keys aligned with backend statuses; COMPLETED groups terminal statuses. */
export type OrderBoardTab =
  | typeof ORDER_STATUS.PAID
  | typeof ORDER_STATUS.PREPARING
  | typeof ORDER_STATUS.OUT_FOR_DELIVERY
  | 'COMPLETED';

export function normalizeOrderStatus(status?: string): string {
  return status?.toUpperCase() ?? '';
}

export function isPreparingStatus(status?: string): boolean {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === ORDER_STATUS.CONFIRMED ||
    normalized === ORDER_STATUS.PREPARING
  );
}

export function isCompletedStatus(status?: string): boolean {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === ORDER_STATUS.DELIVERED ||
    normalized === ORDER_STATUS.CANCELLED ||
    normalized === ORDER_STATUS.FAILED
  );
}

export function bucketOrdersIntoColumns(orders: Order[]): Record<OrderBoardTab, Order[]> {
  return {
    [ORDER_STATUS.PAID]: orders.filter(
      (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.PAID,
    ),
    [ORDER_STATUS.PREPARING]: orders.filter((order) =>
      isPreparingStatus(order.status),
    ),
    [ORDER_STATUS.OUT_FOR_DELIVERY]: orders.filter(
      (order) =>
        normalizeOrderStatus(order.status) === ORDER_STATUS.OUT_FOR_DELIVERY,
    ),
    COMPLETED: orders.filter((order) => isCompletedStatus(order.status)),
  };
}

/** Status filter options for orders visible via GET /outlet-orders. */
export const OUTLET_ORDER_STATUS_FILTER_OPTIONS: Array<{
  value: 'ALL' | BackendOrderStatus;
  label: string;
}> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: ORDER_STATUS.PAID, label: 'Paid (New)' },
  { value: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
  { value: ORDER_STATUS.PREPARING, label: 'Preparing' },
  { value: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
  { value: ORDER_STATUS.DELIVERED, label: 'Delivered' },
  { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
  { value: ORDER_STATUS.FAILED, label: 'Failed' },
];

export const ACTIVE_PIPELINE_STATUSES: BackendOrderStatus[] = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
];

export const STATUS_BADGE_COLORS: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-amber-100 text-amber-700 border-amber-200',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
  FAILED: 'bg-gray-100 text-gray-600 border-gray-200',
};
