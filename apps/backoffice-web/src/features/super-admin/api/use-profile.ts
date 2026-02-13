// apps/backoffice-web/src/features/super-admin/api/super-admin.api.ts
import { axiosInstance } from '@/http/axios';
import { ProfileData } from '../types';

export const SuperAdminApi = {
  getProfile: async (): Promise<ProfileData | null> => {
    const res = await axiosInstance.get('/me/super-admin/profile');
    return res.data.data;
  },

  saveProfile: async (formData: FormData, isUpdate: boolean): Promise<ProfileData> => {
    // According to your logs, POST is used for creation. 
    // If you already have a profile, use PATCH.
    const method = isUpdate ? 'patch' : 'post';
    const res = await axiosInstance[method]('/me/super-admin/profile', formData);
    return res.data.data;
  },
};