import { axiosInstance } from '@/http/axios';
import { DeliveryRule, DeliveryRuleFormValues } from '../types/delivery-rule.types';

export const DeliveryRulesApi = {
  list: async (): Promise<DeliveryRule[]> => {
    const res = await axiosInstance.get('/delivery-rules');
    return res.data.data;
  },

  getById: async (id: string): Promise<DeliveryRule> => {
    const res = await axiosInstance.get(`/delivery-rules/${id}`);
    return res.data.data;
  },

  create: async (payload: DeliveryRuleFormValues): Promise<DeliveryRule> => {
    const res = await axiosInstance.post('/delivery-rules', payload);
    return res.data.data;
  },

  update: async (
    id: string,
    payload: Omit<DeliveryRuleFormValues, 'activate'>,
  ): Promise<DeliveryRule> => {
    const res = await axiosInstance.patch(`/delivery-rules/${id}`, payload);
    return res.data.data;
  },

  activate: async (id: string): Promise<DeliveryRule> => {
    const res = await axiosInstance.patch(`/delivery-rules/${id}/activate`);
    return res.data.data;
  },

  deactivate: async (id: string): Promise<DeliveryRule> => {
    const res = await axiosInstance.patch(`/delivery-rules/${id}/deactivate`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/delivery-rules/${id}`);
  },
};
