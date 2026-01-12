import { http } from '@/http';
import {
  LoginRequest,
  LoginResponse,
  VerifyMfaRequest,
  VerifyMfaResponse,
} from '../types/auth.types';

/**
 * AuthService
 * Pure backend communication for auth flows
 *
 * IMPORTANT:
 * - Uses cookie-based auth (HttpOnly cookies)
 * - Refresh logic is handled globally by interceptor
 * - Auth endpoints must opt out of refresh
 */
export const authService = {
  /**
   * STEP 1: Email + Password
   * → MFA challenge
   */
  async login(
    payload: LoginRequest,
  ): Promise<LoginResponse> {
    const res = await http.post(
      '/auth/super/login',
      payload,
      {
        skipAuthRefresh: true, // 🚫 never refresh during login
      },
    );

    return res.data.data;
  },

  /**
   * STEP 2: MFA Verification
   * → Session cookies set by backend
   */
  async verifyMfa(
    payload: VerifyMfaRequest,
  ): Promise<VerifyMfaResponse> {
    const res = await http.post(
      '/auth/super/verify-mfa',
      payload,
      {
        skipAuthRefresh: true, // 🚫 never refresh during MFA
      },
    );

    return res.data.data;
  },

  /**
   * Logout current session
   * - Clears cookies on backend
   * - Must NOT trigger refresh
   */
  async logout(): Promise<void> {
    await http.post(
      '/auth/session/logout',
      null,
      {
        skipAuthRefresh: true, // 🔑 VERY IMPORTANT
      },
    );
  },
};
