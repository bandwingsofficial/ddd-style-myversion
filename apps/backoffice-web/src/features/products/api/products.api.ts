import { axiosInstance } from '@/http/axios';
import {
  PaginatedProducts,
  Product,
  ProductStatus,
} from '../types/product.types';

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
}

export interface CreateProductPayload {
  categoryId: string;
  productName: string;
  originalPrice: number;
  discountPrice?: number;
  unitValue: number;
  unitType: string;
  shortDescription?: string;
  longDescription?: string;
  isTrending?: boolean;
  tags?: string[];
  mainImage: File;
  galleryImages?: File[];
}

export const ProductsApi = {
  list: async (
    params: ListProductsParams = {},
  ): Promise<PaginatedProducts> => {
    const res = await axiosInstance.get('/products', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const formData = new FormData();

    formData.append('categoryId', payload.categoryId);
    formData.append('productName', payload.productName);
    formData.append('originalPrice', String(payload.originalPrice));

    if (
      payload.discountPrice !== undefined &&
      payload.discountPrice > 0
    ) {
      formData.append('discountPrice', String(payload.discountPrice));
    }

    formData.append('unitValue', String(payload.unitValue));
    formData.append('unitType', payload.unitType);

    if (payload.shortDescription) {
      formData.append('shortDescription', payload.shortDescription);
    }

    if (payload.longDescription) {
      formData.append('longDescription', payload.longDescription);
    }

    formData.append('isTrending', String(!!payload.isTrending));

    payload.tags?.forEach((tag) => {
      formData.append('tags', tag);
    });

    formData.append('mainImage', payload.mainImage);

    payload.galleryImages?.forEach((file) => {
      formData.append('galleryImages', file);
    });

    const res = await axiosInstance.post('/products', formData);
    return res.data.data;
  },

  updateDetails: async (
    productId: string,
    payload: {
      productName: string;
      originalPrice: number;
      discountPrice: number;
      shortDescription: string;
      longDescription: string;
    },
  ) => {
    await axiosInstance.post(`/products/${productId}/price`, {
      originalPrice: Number(payload.originalPrice),
      discountPrice: Number(payload.discountPrice),
    });

    await axiosInstance.post(`/products/${productId}/update`, {
      productName: payload.productName,
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
    });
  },

  replaceMainImage: async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('mainImage', file);

    const res = await axiosInstance.post(
      `/products/${productId}/images/main`,
      formData,
    );

    return res.data.data;
  },

  replaceGalleryImage: async (
    productId: string,
    galleryImageId: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append('galleryImageId', galleryImageId);
    formData.append('galleryImages', file);

    const res = await axiosInstance.post(
      `/products/${productId}/images/replace`,
      formData,
    );

    return res.data.data;
  },

  addGalleryImage: async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('galleryImages', file);

    const res = await axiosInstance.post(
      `/products/${productId}/images/add`,
      formData,
    );

    return res.data.data;
  },

  deleteGalleryImage: async (
    productId: string,
    galleryImageId: string,
  ) => {
    const res = await axiosInstance.post(
      `/products/${productId}/images/delete`,
      { galleryImageId },
    );

    return res.data.data;
  },

  reorderGalleryImages: async (
    productId: string,
    galleryImageIds: string[],
  ) => {
    const res = await axiosInstance.post(
      `/products/${productId}/images/reorder`,
      { galleryImageIds },
    );

    return res.data.data;
  },

  updateStatus: async (productId: string, status: ProductStatus) => {
    const res = await axiosInstance.patch(`/products/${productId}/status`, {
      status,
    });
    return res.data.data as Product;
  },

  delete: async (productId: string): Promise<{ id: string }> => {
    const res = await axiosInstance.delete(`/products/${productId}`);
    return res.data.data;
  },

  markTrending: async (productId: string, turnOn: boolean) => {
    const endpoint = turnOn ? 'on' : 'off';
    return axiosInstance.post(`/products/${productId}/trending/${endpoint}`);
  },
};
