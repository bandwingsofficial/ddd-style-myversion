import { axiosInstance } from "@/http/axios";
import { CreateOutletUserPayload } from "./users.types";

export const UsersService = {
  // --- Existing Outlet/User Methods ---
  getOutlets() {
    return axiosInstance.get("/outlets");
  },

  getUsersByOutlet(outletId: string) {
    return axiosInstance.get(`/outlets/${outletId}/users`);
  },

  createUser(payload: CreateOutletUserPayload) {
    return axiosInstance.post("/outlets/users", payload);
  },

  resetPassword(email: string, newPassword: string) {
    return axiosInstance.post("/outlets/users/reset-password", {
      email,
      newPassword,
    });
  },

  enableUser(userId: string) {
    return axiosInstance.post(`/outlets/users/${userId}/enable`);
  },

  disableUser(userId: string) {
    return axiosInstance.post(`/outlets/users/${userId}/disable`);
  },

  getOutletStock(outletId: string) {
    return axiosInstance.get(`/inventory/outlet/${outletId}`);
  },

  // --- NEW: Outlet Product Methods ---

  // Get all products assigned to an outlet
  getOutletProducts(outletId: string) {
    return axiosInstance.get(`/outlets/${outletId}/products`);
  },

  // Get master list of all available products (to select from when assigning)
  // Assuming you have an endpoint to get the "Master Product List" to choose from.
  // If not, you might need to fetch this from a different service.
  getMasterProducts() {
    return axiosInstance.get(`/products`); 
  },

  // Assign a product to an outlet
  assignProductToOutlet(outletId: string, productId: string) {
    return axiosInstance.post(`/outlets/${outletId}/products`, { productId });
  },

  // Enable a product for an outlet
  enableOutletProduct(outletId: string, productId: string) {
    return axiosInstance.post(`/outlets/${outletId}/products/${productId}/enable`);
  },

  // Disable a product for an outlet
  disableOutletProduct(outletId: string, productId: string) {
    return axiosInstance.post(`/outlets/${outletId}/products/${productId}/disable`);
  },

  // Override price/discount
  overrideProductPrice(outletId: string, productId: string, price: number, discount: number) {
    return axiosInstance.post(`/outlets/${outletId}/products/${productId}/pricing`, {
      priceOverride: price,
      discountOverride: discount
    });
  },

  // Remove product from outlet
  removeProductFromOutlet(outletId: string, productId: string) {
    return axiosInstance.delete(`/outlets/${outletId}/products/${productId}`);
  }
};