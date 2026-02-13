import { api } from '@/http/axios/instance';
import { OutletProfile } from '../types/outletProfile.types';

const BASE = '/outlets';

export const outletProfileApi = {
  get(outletId: string) {
    return api.get<{ data: OutletProfile }>(`${BASE}/${outletId}/profile`);
  },

  create(outletId: string, payload: FormData) {
    return api.post<{ data: OutletProfile }>(
      `${BASE}/${outletId}/profile`,
      payload,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  update(outletId: string, payload: FormData) {
    return api.patch<{ data: OutletProfile }>(
      `${BASE}/${outletId}/profile`,
      payload,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  delete(outletId: string) {
    return api.delete(`${BASE}/${outletId}/profile`);
  },
};