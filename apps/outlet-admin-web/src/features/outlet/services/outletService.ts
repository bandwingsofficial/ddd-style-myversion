// src/features/outlet/services/outletService.ts

import { api } from "@/http/axios/instance"; 
import { Outlet, OutletProduct, ApiResponse, ProductDetails } from "../types";

export const outletService = {
  // 1. Get Outlet Details
  getOutlet: async (): Promise<Outlet> => {
    const response = await api.get<ApiResponse<Outlet>>("/my-outlet");
    return response.data.data;
  },

  // ✅ 2. Get Products (FETCH & MERGE STRATEGY)
  getProducts: async (): Promise<OutletProduct[]> => {
    try {
      // Step A: Fetch the Admin Status List (contains ID + isAvailable status)
      const adminResponse = await api.get<ApiResponse<OutletProduct[]>>("/my-outlet/products");
      const adminProducts = adminResponse.data.data;

      // Step B: Fetch the Public Product Catalog (contains Name, Image, Price)
      // We use the public endpoint that the customer app uses
      const publicResponse = await api.get<ApiResponse<ProductDetails[]>>("/public/products");
      const publicDetails = publicResponse.data.data; // Assuming this returns all products

      // Step C: Merge them together
      const mergedData = adminProducts.map((adminItem) => {
        // Find the matching details in the public list
        const details = publicDetails.find((p) => p.id === adminItem.productId);
        
        return {
          ...adminItem,
          // If details found, use them. If not, provide fallback.
          product: details || { 
            id: adminItem.productId, 
            name: "Unknown Product", 
            price: 0, 
            slug: "#" 
          }
        };
      });

      return mergedData;
    } catch (error) {
      console.error("Merge failed, returning raw list", error);
      // Fallback: return unmerged list if public API fails
      const response = await api.get<ApiResponse<OutletProduct[]>>("/my-outlet/products");
      return response.data.data;
    }
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
  }
};