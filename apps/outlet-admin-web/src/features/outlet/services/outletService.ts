import { api } from "@/http/axios/instance"; // Adjust path if needed
import { Outlet, OutletProduct, ApiResponse } from "../types";

export const outletService = {
  // 1. Get Outlet Details
  getOutlet: async (): Promise<Outlet> => {
    const response = await api.get<ApiResponse<Outlet>>("/my-outlet");
    return response.data.data;
  },

  // 2. Get Products
  getProducts: async (): Promise<OutletProduct[]> => {
    const response = await api.get<ApiResponse<OutletProduct[]>>("/my-outlet/products");
    return response.data.data;
  },

  // 3. Toggle Product Availability
  toggleProduct: async (productId: string, action: "enable" | "disable") => {
    const response = await api.post<ApiResponse<null>>(
      `/my-outlet/products/${productId}/${action}`
    );
    return response.data;
  },

  // 4. Update Working Status
  updateWorkingStatus: async (status: "OPEN" | "CLOSED") => {
    const response = await api.post<ApiResponse<null>>("/my-outlet/working-status", { status });
    return response.data;
  },

  // 5. Camera Control
  toggleCamera: async (action: "on" | "off", streamUrl?: string) => {
    const payload = action === "on" ? { streamUrl } : {};
    const response = await api.post<ApiResponse<null>>(`/my-outlet/camera/${action}`, payload);
    return response.data;
  },
};