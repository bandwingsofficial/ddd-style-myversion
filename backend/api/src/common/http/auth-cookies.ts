import { Response } from 'express';

/**
 * HTTPS + cross-subdomain cookies
 * admin.dev.local ↔ api.dev.local
 *
 * REQUIREMENTS (all satisfied):
 * - HTTPS
 * - sameSite = 'none'
 * - secure = true
 * - shared domain
 * - camelCase cookie names (frontend-compatible)
 */

const baseCookieOptions = {
  httpOnly: true,
  secure: true,               // 🔒 HTTPS only
  sameSite: 'none' as const,  // 🔒 Required for cross-site cookies
  domain: '.dev.local',       // 🔑 Share across subdomains
  path: '/',
};

export function setAuthCookies(
  res: Response,
  data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  },
) {
  res.cookie('accessToken', data.accessToken, {
    ...baseCookieOptions,
    expires: new Date(data.accessTokenExpiresAt),
  });

  res.cookie('refreshToken', data.refreshToken, {
    ...baseCookieOptions,
    expires: new Date(data.refreshTokenExpiresAt),
  });
}

export function clearAuthCookies(res: Response) {
  /**
   * clearCookie MUST match the SAME options
   */
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
}
