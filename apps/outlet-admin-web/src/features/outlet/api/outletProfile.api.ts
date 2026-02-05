import { api } from '@/http/axios/instance';
import {
  OutletProfile,
  CreateOutletProfilePayload,
  UpdateOutletProfilePayload,
} from '../types/outletProfile.types';

const BASE = '/outlets';

export const outletProfileApi = {
  get(outletId: string) {
    return api.get<{ data: OutletProfile }>(`${BASE}/${outletId}/profile`);
  },

  create(outletId: string, payload: CreateOutletProfilePayload) {
    return api.post<{ data: OutletProfile }>(
      `${BASE}/${outletId}/profile`,
      payload
    );
  },

  update(outletId: string, payload: UpdateOutletProfilePayload) {
    return api.patch<{ data: OutletProfile }>(
      `${BASE}/${outletId}/profile`,
      payload
    );
  },

  delete(outletId: string) {
    return api.delete(`${BASE}/${outletId}/profile`);
  },
};
