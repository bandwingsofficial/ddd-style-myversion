import { api } from '@/http/axios/instance';
import { Order, OrderResponse, SingleOrderResponse } from '../types';

/**
 * Fetches all orders associated with the current outlet.
 * Uses the updated OrderResponse structure.
 */
export const fetchOutletOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<OrderResponse>('/outlet-orders');
  return data.data;
};

/**
 * Fetches details for a specific order by ID.
 * Useful for the Order Details modal or page.
 */
export const fetchOrderById = async (id: string): Promise<Order> => {
  const { data } = await api.get<SingleOrderResponse>(`/outlet-orders/${id}`);
  return data.data;
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
 * Transitions order status to OUT_FOR_DELIVERY / DISPATCH.
 */
export const setOutForDelivery = async (id: string) => 
  api.post(`/outlet-orders/${id}/out-for-delivery`);

/**
 * Finalizes the order as DELIVERED.
 */
export const setDelivered = async (id: string) => 
  api.post(`/outlet-orders/${id}/delivered`);