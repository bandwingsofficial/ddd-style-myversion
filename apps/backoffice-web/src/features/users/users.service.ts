import { axiosInstance } from '@/http/axios';
import { OutletsApi } from '@/features/outlets/api/outlets.api';
import { Outlet } from '@/features/outlets/types/outlet.types';
import { ProductsApi } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types/product.types';
import { unwrapApiList } from '@/lib/unwrap-api-list';
import { CreateOutletUserPayload, OutletProduct, OutletUser } from './users.types';

export interface OutletStockRecord {
  id: string;
  stockItemId: string;
  unit: string;
  quantity: { value: number } | number;
  updatedAt?: string;
}

export const UsersService = {
  getOutlets: async (): Promise<Outlet[]> => {
    return OutletsApi.list();
  },

  getOutletById: async (outletId: string): Promise<Outlet | null> => {
    return OutletsApi.getById(outletId);
  },

  getUsersByOutlet: async (outletId: string): Promise<OutletUser[]> => {
    const res = await axiosInstance.get(`/outlets/${outletId}/users`);
    return unwrapApiList<OutletUser>(res.data?.data);
  },

  createUser(payload: CreateOutletUserPayload) {
    return axiosInstance.post('/outlets/users', payload);
  },

  resetPassword(email: string, newPassword: string) {
    return axiosInstance.post('/outlets/users/reset-password', {
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

  getOutletStock: async (outletId: string): Promise<OutletStockRecord[]> => {
    const res = await axiosInstance.get(`/inventory/outlet/${outletId}`);
    return unwrapApiList<OutletStockRecord>(res.data?.data);
  },

  getOutletProducts: async (outletId: string): Promise<OutletProduct[]> => {
    const res = await axiosInstance.get(`/outlets/${outletId}/products`);
    return unwrapApiList<OutletProduct>(res.data?.data);
  },

  getMasterProducts: async (): Promise<Product[]> => {
    return ProductsApi.listActiveForSelection();
  },

  assignProductToOutlet(outletId: string, productId: string) {
    return axiosInstance.post(`/outlets/${outletId}/products`, { productId });
  },

  enableOutletProduct(outletId: string, productId: string) {
    return axiosInstance.post(
      `/outlets/${outletId}/products/${productId}/enable`,
    );
  },

  disableOutletProduct(outletId: string, productId: string) {
    return axiosInstance.post(
      `/outlets/${outletId}/products/${productId}/disable`,
    );
  },

  overrideProductPrice(
    outletId: string,
    productId: string,
    price: number,
    discount: number,
  ) {
    return axiosInstance.post(
      `/outlets/${outletId}/products/${productId}/pricing`,
      {
        priceOverride: price,
        discountOverride: discount,
      },
    );
  },

  removeProductFromOutlet(outletId: string, productId: string) {
    return axiosInstance.delete(
      `/outlets/${outletId}/products/${productId}`,
    );
  },
};
