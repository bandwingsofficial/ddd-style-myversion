import { axiosInstance } from '@/http/axios';
import { unwrapApiList } from '@/lib/unwrap-api-list';
import {
  CreateOutletUserPayload,
  OutletUser,
  UpdateOutletUserPayload,
} from '../types/outlet-user.types';

export const OutletUsersApi = {
  listByOutlet: async (outletId: string): Promise<OutletUser[]> => {
    const res = await axiosInstance.get(`/outlets/${outletId}/users`);
    return unwrapApiList<OutletUser>(res.data?.data);
  },

  create: async (payload: CreateOutletUserPayload): Promise<OutletUser> => {
    const res = await axiosInstance.post('/outlets/users', payload);
    return res.data.data;
  },

  update: async (
    userId: string,
    payload: UpdateOutletUserPayload,
  ): Promise<OutletUser> => {
    const res = await axiosInstance.post(
      `/outlets/users/${userId}/update`,
      payload,
    );
    return res.data.data;
  },

  delete: async (userId: string): Promise<{ id: string }> => {
    const res = await axiosInstance.delete(`/outlets/users/${userId}`);
    return res.data.data;
  },

  enable: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/outlets/users/${userId}/enable`);
  },

  disable: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/outlets/users/${userId}/disable`);
  },

  resetPassword: async (email: string, newPassword: string): Promise<void> => {
    await axiosInstance.post('/outlets/users/reset-password', {
      email,
      newPassword,
    });
  },
};
