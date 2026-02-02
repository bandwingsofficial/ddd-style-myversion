import { api } from '@/http/axios/instance'; // Or wherever your axios instance is
import { Order, OrderResponse } from '../types';

export const fetchOutletOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<OrderResponse>('/outlet-orders');
  return data.data;
};

// Action functions matching your endpoints
export const acceptOrder = async (id: string) => api.post(`/outlet-orders/${id}/accept`);
export const rejectOrder = async (id: string) => api.post(`/outlet-orders/${id}/reject`);
export const setPreparing = async (id: string) => api.post(`/outlet-orders/${id}/preparing`);
export const setOutForDelivery = async (id: string) => api.post(`/outlet-orders/${id}/out-for-delivery`);
export const setDelivered = async (id: string) => api.post(`/outlet-orders/${id}/delivered`);