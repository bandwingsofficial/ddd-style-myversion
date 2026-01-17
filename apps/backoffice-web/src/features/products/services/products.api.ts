// features/products/services/products.api.ts
import { axiosInstance } from "@/http/axios/instance";
import { Product } from "../types/product.types";

export const ProductsAPI = {
  // Fetch all products
  fetchAll: async (): Promise<Product[]> => {
    const res = await axiosInstance.get("/products");
    return res.data.data;
  },


  update: async (
  productId: string,
  payload: {
    originalPrice: number;
    shortDescription: string;
    longDescription: string;
    mainImage: string;
    galleryImages: string[];
  }
) => {
  // 1. Update price
  await axiosInstance.post(`/products/${productId}/price`, {
    originalPrice: payload.originalPrice,
  });

  // 2. Update descriptions
  await axiosInstance.post(`/products/${productId}/update`, {
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription,
  });

  // 3. Update images
  await axiosInstance.post(`/products/${productId}/images`, {
    mainImage: payload.mainImage,
    galleryImages: payload.galleryImages,
  });

  return true;
},


  
  // ADDED: Fetch single product details
  fetchById: async (productId: string): Promise<Product> => {
    const res = await axiosInstance.get(`/products/${productId}`);
    return res.data.data;
  },

  
  // Create a new product
  create: async (payload: {
    productName: string;
    originalPrice: number;
    stockItemId: string;
    mainImage: string;
  }) => {
    const res = await axiosInstance.post("/products", payload);
    return res.data.data;
  },

  enable: async (productId: string) => {
    return axiosInstance.post(`/products/${productId}/enable`);
  },

  disable: async (productId: string) => {
    return axiosInstance.post(`/products/${productId}/disable`);
  },

  markTrending: async (productId: string, turnOn: boolean) => {
    const endpoint = turnOn ? "on" : "off";
    return axiosInstance.post(`/products/${productId}/trending/${endpoint}`, {
      isTrending: turnOn
    });
  },

  updatePrice: async (productId: string, originalPrice: number) => {
    return axiosInstance.post(`/products/${productId}/price`, { originalPrice });
  },

  //image correction

  updateDetails: async (productId: string, payload: { shortDescription: string }) => {
    return axiosInstance.post(`/products/${productId}/update`, payload);
  }
};