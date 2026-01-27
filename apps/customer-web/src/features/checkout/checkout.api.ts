import customerAxios from "@/http/axios/customerAxios";
import { CheckoutSummary, CheckoutStartResponse, OrderDetails } from "./checkout.types";

export const CheckoutApi = {
  // 1. Get Preview/Summary
  getSummary: async (addressId: string) => {
    // Matches GET https://admin.dev.local:4000/checkout/summary/:id
    const { data } = await customerAxios.get<{ data: CheckoutSummary }>(`/checkout/summary/${addressId}`);
    return data.data;
  },

  // 2. Start Order (Lock Cart)
  startCheckout: async (savedAddressId: string) => {
    // Matches POST https://admin.dev.local:4000/checkout/start
    const { data } = await customerAxios.post<{ data: CheckoutStartResponse }>("/checkout/start", { savedAddressId });
    return data.data;
  },

  // 3. Confirm Payment
  confirmPayment: async (paymentId: string) => {
    // Matches POST https://admin.dev.local:4000/payments/:id/confirm
    const { data } = await customerAxios.post<{ data: any }>(`/payments/${paymentId}/confirm`);
    return data.data;
  },

  // 4. Get Final Order (Single)
  getOrder: async (orderId: string) => {
    // Matches GET https://admin.dev.local:4000/orders/:id
    const { data } = await customerAxios.get<{ data: OrderDetails }>(`/orders/${orderId}`);
    return data.data;
  },

  // 5. Get All Orders (List)
  getMyOrders: async () => {
    const { data } = await customerAxios.get<{ data: OrderDetails[] }>("/my-orders");
    return data.data;
  }
};