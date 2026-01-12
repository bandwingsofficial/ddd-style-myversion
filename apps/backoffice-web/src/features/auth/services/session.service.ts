import { http } from '@/http';
import {
  SessionResponse,
} from '../types/auth.types';

/**
 * SessionService
 * Handles session-level backend APIs
 *
 * IMPORTANT:
 * - Uses HttpOnly cookies (accessToken / refreshToken)
 * - Refresh logic is handled globally by interceptor
 */
export const sessionService = {
  /**
   * Get current authenticated session
   * - Reads accessToken cookie on backend
   * - MUST allow refresh on 401
   */
  async me(): Promise<SessionResponse> {
    const res = await http.get('/auth/session/me');

    return res.data.data;
  },

  /**
   * Logout ALL sessions for current actor
   * - Clears cookies on backend
   * - MUST NOT trigger refresh
   */
  async logoutAll(): Promise<void> {
    await http.post(
      '/auth/session/logout-all',
      null,
      {
        skipAuthRefresh: true, // 🔑 REQUIRED
      },
    );
  },
};
