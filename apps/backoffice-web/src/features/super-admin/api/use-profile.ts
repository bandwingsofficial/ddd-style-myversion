// apps/backoffice-web/src/features/super-admin/api/super-admin.api.ts
import { axiosInstance } from '@/http/axios';
import { ProfileData, ProfileFormValues } from '../types';

export const SuperAdminApi = {
  getProfile: async (): Promise<ProfileData | null> => {
    const res = await axiosInstance.get('/me/super-admin/profile');
    return res.data.data;
  },

  createProfile: async (data: ProfileFormValues): Promise<ProfileData> => {
    const res = await axiosInstance.post('/me/super-admin/profile', data);
    return res.data.data;
  },

  updateProfile: async (data: Partial<ProfileFormValues>): Promise<ProfileData> => {
    const res = await axiosInstance.patch('/me/super-admin/profile', data);
    return res.data.data;
  },

  deleteProfile: async (): Promise<void> => {
    await axiosInstance.delete('/me/super-admin/profile');
  }
};