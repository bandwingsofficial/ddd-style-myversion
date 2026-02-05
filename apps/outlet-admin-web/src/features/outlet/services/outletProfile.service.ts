import { outletProfileApi } from '../api/outletProfile.api';
import {
  CreateOutletProfilePayload,
  UpdateOutletProfilePayload,
} from '../types/outletProfile.types';

export const outletProfileService = {
  async get(outletId: string) {
    const res = await outletProfileApi.get(outletId);
    return res.data.data;
  },

  async create(outletId: string, payload: CreateOutletProfilePayload) {
    const res = await outletProfileApi.create(outletId, payload);
    return res.data.data;
  },

  async update(outletId: string, payload: UpdateOutletProfilePayload) {
    const res = await outletProfileApi.update(outletId, payload);
    return res.data.data;
  },

  async delete(outletId: string) {
    await outletProfileApi.delete(outletId);
  },
};
