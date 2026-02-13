import { outletProfileApi } from '../api/outletProfile.api';

export const outletProfileService = {
  async get(outletId: string) {
    const res = await outletProfileApi.get(outletId);
    return res.data.data;
  },

  async create(outletId: string, payload: FormData) {
    const res = await outletProfileApi.create(outletId, payload);
    return res.data.data;
  },

  async update(outletId: string, payload: FormData) {
    const res = await outletProfileApi.update(outletId, payload);
    return res.data.data;
  },

  async delete(outletId: string) {
    await outletProfileApi.delete(outletId);
  },
};