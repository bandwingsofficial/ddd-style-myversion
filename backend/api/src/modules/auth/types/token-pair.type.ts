export interface TokenPair {
  accessToken: string;
  refreshToken: string;

  /**
   * Absolute expiry timestamps
   */
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}
