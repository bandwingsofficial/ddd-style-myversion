import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";

export const OrdersApi = {
  getOrders: async (): Promise<OrderDetails[]> => {
    return CheckoutApi.getMyOrders();
  },

  getOrder: async (
    orderId: string,
  ): Promise<OrderDetails> => {
    return CheckoutApi.getOrder(orderId);
  },

  cancelOrder: async (
    orderId: string,
  ): Promise<OrderDetails> => {
    return CheckoutApi.cancelOrder(orderId);
  },
};