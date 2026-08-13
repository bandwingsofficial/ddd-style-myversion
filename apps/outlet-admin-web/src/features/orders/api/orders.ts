import { api } from '@/http/axios/instance';
import {
  Order,
  OrderResponse,
  PaginatedOrderResponse,
  SingleOrderResponse,
} from '../types';
import { attachOrderCustomer } from '../utils/order-customer.util';

export type OutletOrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

/**
 * Fetches all orders associated with the current outlet (live board).
 */
export const fetchOutletOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<OrderResponse>('/outlet-orders');
  return (data.data ?? []).map(attachOrderCustomer);
};

/**
 * Fetches outlet order history with server-side filters and pagination.
 */
export const fetchOutletOrderHistory = async (
  params: OutletOrderListParams,
): Promise<{
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.status?.trim()) {
    query.status = params.status.trim();
  }
  if (params.fromDate) {
    query.fromDate = params.fromDate;
  }
  if (params.toDate) {
    query.toDate = params.toDate;
  }

  const { data } = await api.get<PaginatedOrderResponse>('/outlet-orders', {
    params: query,
  });

  const payload = data.data;
  return {
    items: (payload.items ?? []).map(attachOrderCustomer),
    total: payload.total,
    page: payload.page,
    limit: payload.limit,
    totalPages: payload.totalPages,
  };
};

/**
 * Fetches details for a specific order by ID.
 */
export const fetchOrderById = async (id: string): Promise<Order> => {
  const { data } = await api.get<SingleOrderResponse>(`/outlet-orders/${id}`);
  return attachOrderCustomer(data.data);
};

// --- Status Update Actions ---

export const acceptOrder = async (id: string) =>
  api.post(`/outlet-orders/${id}/accept`);

export const rejectOrder = async (id: string) =>
  api.post(`/outlet-orders/${id}/reject`);

/**
 * Transitions order status to PREPARING.
 * Usually called after the order is accepted and the kitchen starts work.
 */
export const setPreparing = async (id: string) =>
  api.post(`/outlet-orders/${id}/preparing`);

/**
 * Transitions order status to OUT_FOR_DELIVERY.
 */
export const setOutForDelivery = async (id: string) =>
  api.post(`/outlet-orders/${id}/out-for-delivery`);

/**
 * Finalizes the order as DELIVERED.
 */
export const setDelivered = async (id: string) =>
  api.post(`/outlet-orders/${id}/delivered`);
