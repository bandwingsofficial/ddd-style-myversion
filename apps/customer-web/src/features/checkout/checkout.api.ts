import customerAxios from "@/http/axios/customerAxios";
import { 
  CheckoutSummary, 
  CheckoutStartResponse, 
  OrderDetails, 
  CheckoutStartRequest,
  PaymentVerificationRequest 
} from "./checkout.types";

export const CheckoutApi = {
  getSummary: async (addressId: string, outletId?: string) => {
    const config = outletId ? { params: { outletId } } : {};
    const { data } = await customerAxios.get<{ data: CheckoutSummary }>(
        `/checkout/summary/${addressId}`, 
        config
    );
    return data.data;
  },

  startCheckout: async (payload: CheckoutStartRequest) => {
    const { data } = await customerAxios.post<{ data: CheckoutStartResponse }>("/checkout/start", payload);
    return data.data;
  },

  // ✅ FIXED: Matches your backend log: POST /payments/:paymentId/confirm
  confirmPayment: async (payload: PaymentVerificationRequest) => {
    const { data } = await customerAxios.post<{ data: any }>(
        `/payments/${payload.paymentId}/confirm`, 
        payload // Sending signature details in body for verification
    );
    return data.data;
  },

  getOrder: async (orderId: string) => {
    const { data } = await customerAxios.get<{ data: OrderDetails }>(`/orders/${orderId}`);
    return data.data;
  },

  getMyOrders: async () => {
    const { data } = await customerAxios.get<{ data: OrderDetails[] }>("/my-orders");
    return data.data;
  }
};