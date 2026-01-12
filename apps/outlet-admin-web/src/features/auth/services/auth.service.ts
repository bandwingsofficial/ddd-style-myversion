import { api } from '@/http/axios';
import { LoginPayload, OutletSession } from '../types/auth.types';

export const outletAuthService = {
  // LOGIN
  async login(payload: LoginPayload): Promise<void> {
    await api.post('/auth/outlets/login', payload);
    // Cookie is set by backend (HttpOnly)
  },

  // SESSION (ME)
  async getSession(): Promise<OutletSession> {
    const { data } = await api.get('/auth/session/me');
    return data.data;
  },

  // REFRESH
  async refresh(): Promise<void> {
    await api.post('/auth/session/refresh');
  },

  // LOGOUT
  async logout(): Promise<void> {
    await api.post('/auth/session/logout');
  }
};
