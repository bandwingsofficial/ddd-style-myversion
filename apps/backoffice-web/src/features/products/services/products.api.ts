// features/products/services/products.api.ts
import { axiosInstance } from "@/http/axios/instance";
import { Product } from "../types/product.types";

export const ProductsAPI = {
  // Fetch all products
  fetchAll: async (): Promise<Product[]> => {
    const res = await axiosInstance.get("/products?limit=1000&page=1");
    return res.data.data;
  },

  // Fetch single product
  fetchById: async (productId: string): Promise<Product> => {
    const res = await axiosInstance.get(`/products/${productId}`);
    return res.data.data;
  },

  // Create Product
  create: async (payload: {
  categoryId: string;
  stockItemId: string;
  productName: string;
  originalPrice: number;
  discountPrice?: number;
  unitValue: number;
  unitType: string;
  shortDescription: string;
  longDescription: string;
  isTrending: boolean;
  tags: string[];
  mainImage: File;
  galleryImages: File[];
}) => {
  const formData = new FormData();

  formData.append("categoryId", payload.categoryId);
  formData.append("stockItemId", payload.stockItemId);
  formData.append("productName", payload.productName);

  formData.append("originalPrice", String(payload.originalPrice));

  if (
    payload.discountPrice !== undefined &&
    payload.discountPrice > 0
  ) {
    formData.append(
      "discountPrice",
      String(payload.discountPrice)
    );
  }

  formData.append("unitValue", String(payload.unitValue));
  formData.append("unitType", payload.unitType);

  if (payload.shortDescription) {
    formData.append(
      "shortDescription",
      payload.shortDescription
    );
  }

  if (payload.longDescription) {
    formData.append(
      "longDescription",
      payload.longDescription
    );
  }

  formData.append(
    "isTrending",
    String(payload.isTrending)
  );

  payload.tags.forEach(tag => {
    formData.append("tags", tag);
  });

  formData.append("mainImage", payload.mainImage);

  payload.galleryImages.forEach(file => {
    formData.append("galleryImages", file);
  });
  
  const res = await axiosInstance.post(
    "/products",
    formData
  );

  return res.data.data;
},
  // Update Product (FIXED: Always sends mainImage)
  update: async (
    productId: string,
    payload: {
      productName: string;
      originalPrice: number;
      discountPrice: number;
      shortDescription: string;
      longDescription: string;
      mainImage: string | File;
      galleryImages: (string | File)[];
    }
  ) => {
    // 1. Update Price
    await axiosInstance.post(`/products/${productId}/price`, {
      originalPrice: Number(payload.originalPrice),
      discountPrice: Number(payload.discountPrice)
    });

    // 2. Update Details
    await axiosInstance.post(`/products/${productId}/update`, {
      productName: payload.productName,
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
    });

    // 3. Update Images
    // We strictly prepare FormData to ensure 'mainImage' is ALWAYS present
    const imageFormData = new FormData();
    let hasImageUpdates = false;

    // Handle Main Image: Send File if new, String path if existing
    if (payload.mainImage instanceof File) {
        imageFormData.append("mainImage", payload.mainImage);
        hasImageUpdates = true;
    } else if (typeof payload.mainImage === 'string' && payload.mainImage) {
        // Send the existing path string to satisfy "should not be empty"
        imageFormData.append("mainImage", payload.mainImage);
        // We consider this an update context if gallery images are changing
    }

    // Handle Gallery Images
    if (payload.galleryImages && payload.galleryImages.length > 0) {
        payload.galleryImages.forEach((file) => {
            if (file instanceof File) {
                imageFormData.append("galleryImages", file);
                hasImageUpdates = true;
            }
        });
    }

    // Only hit the endpoint if we have actual files OR if we need to re-validate the main image string
    // To be safe and fix your error, we call this whenever mainImage exists.
    if (payload.mainImage || hasImageUpdates) {
        await axiosInstance.post(`/products/${productId}/images`, imageFormData, {
             headers: { "Content-Type": "multipart/form-data" },
        });
    }

    return true;
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
  
  fetchCategories: async () => {
    const res = await axiosInstance.get("/categories?limit=1000&page=1");
    return res.data.data; 
  }
};