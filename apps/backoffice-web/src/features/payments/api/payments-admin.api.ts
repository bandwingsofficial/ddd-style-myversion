import { axiosInstance } from '@/http/axios';

export interface AdminPaymentListItem {
  id: string;
  orderId: string;
  orderNumber: string | null;
  customerId: string;
  customerName: string | null;
  outletId: string;
  outletName: string | null;
  status: string;
  method: string;
  provider: string | null;
  providerRefId: string | null;
  transactionId: string | null;
  amount: number;
  attemptNo: number;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentListResponse {
  items: AdminPaymentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const PaymentsAdminApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderId?: string;
  }) => {
    const res = await axiosInstance.get<{ data: AdminPaymentListResponse }>(
      '/admin/payments',
      { params },
    );
    return res.data.data;
  },

  getById: async (paymentId: string) => {
    const res = await axiosInstance.get<{ data: unknown }>(
      `/admin/payments/${paymentId}`,
    );
    return res.data.data;
  },
};
