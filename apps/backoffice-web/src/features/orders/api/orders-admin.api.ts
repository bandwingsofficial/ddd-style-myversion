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
    fromDate?: string;
    toDate?: string;
  }) => {
    const query: Record<string, string | number> = {};
    if (params?.page != null) query.page = params.page;
    if (params?.limit != null) query.limit = params.limit;
    if (params?.status) query.status = params.status;
    if (params?.search?.trim()) query.search = params.search.trim();
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;

    const res = await axiosInstance.get<{ data: AdminOrderListResponse }>(
      '/admin/orders',
      { params: query },
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
