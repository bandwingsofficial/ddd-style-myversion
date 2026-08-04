import customerAxios from "@/http/axios/customerAxios";
import {
  CheckoutSummary,
  CheckoutStartResponse,
  OrderDetails,
  CheckoutStartRequest,
  PaymentVerificationRequest,
  PendingOrderSummary,
} from "./checkout.types";

export const CheckoutApi = {
  getSummary: async (addressId: string, outletId?: string) => {
    const config = outletId ? { params: { outletId } } : {};
    const { data } = await customerAxios.get<{ data: CheckoutSummary }>(
      `/checkout/summary/${addressId}`,
      config,
    );
    return data.data;
  },

  startCheckout: async (payload: CheckoutStartRequest) => {
    const { data } = await customerAxios.post<{ data: CheckoutStartResponse }>(
      "/checkout/start",
      payload,
    );
    return data.data;
  },

  retryPayment: async (orderId: string) => {
    const { data } = await customerAxios.post<{ data: CheckoutStartResponse }>(
      `/checkout/orders/${orderId}/retry-payment`,
    );
    return data.data;
  },

  listPendingOrders: async () => {
    const { data } = await customerAxios.get<{ data: PendingOrderSummary[] }>(
      "/checkout/pending",
    );
    return data.data;
  },

  confirmPayment: async (payload: PaymentVerificationRequest) => {
    const { data } = await customerAxios.post<{
      data: { id: string; orderId: string; status: string };
    }>(`/payments/${payload.paymentId}/confirm`, {
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpayOrderId: payload.razorpayOrderId,
      razorpaySignature: payload.razorpaySignature,
    });
    return data.data;
  },

  cancelOrder: async (orderId: string) => {
    const { data } = await customerAxios.post<{ data: OrderDetails }>(
      `/orders/${orderId}/cancel`,
    );
    return data.data;
  },

  getOrder: async (orderId: string) => {
    const { data } = await customerAxios.get<{ data: OrderDetails }>(
      `/orders/${orderId}`,
    );
    return data.data;
  },

  getMyOrders: async () => {
    const { data } = await customerAxios.get<{ data: OrderDetails[] }>(
      "/my-orders",
    );
    return data.data;
  },

  getActiveCheckout: async (outletId: string) => {
    const { data } = await customerAxios.get<{
      data: {
        orderId: string;
        orderNumber: string;
        status: string;
        grandTotal: number;
        currency: string;
        paymentExpiresAt?: string | null;
        remainingSeconds?: number;
      } | null;
    }>("/checkout/active", { params: { outletId } });
    return data.data;
  },
};
