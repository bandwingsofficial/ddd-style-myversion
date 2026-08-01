import { axiosInstance } from '@/http/axios';

import {
  AdminOrderDetail,
  AdminOrderListResponse,
} from '../types/order.types';

export const OrdersAdminApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const res = await axiosInstance.get<{ data: AdminOrderListResponse }>(
      '/admin/orders',
      { params },
    );
    return res.data.data;
  },

  getById: async (orderId: string) => {
    const res = await axiosInstance.get<{ data: AdminOrderDetail }>(
      `/admin/orders/${orderId}`,
    );
    return res.data.data;
  },
};
