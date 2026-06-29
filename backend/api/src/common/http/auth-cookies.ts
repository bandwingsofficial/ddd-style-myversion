import { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  ...(process.env.COOKIE_DOMAIN
    ? { domain: process.env.COOKIE_DOMAIN }
    : {}),
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
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
}
