export const AuthErrors = {
  /* ---------------- AUTH ---------------- */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  /* ---------------- OTP ---------------- */
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',

  OTP_ALREADY_SENT: 'OTP_ALREADY_SENT', // resend within 60s
  OTP_SEND_LIMIT_EXCEEDED: 'OTP_SEND_LIMIT_EXCEEDED', // 10/hour
  OTP_VERIFY_LIMIT_EXCEEDED: 'OTP_VERIFY_LIMIT_EXCEEDED', // 5 wrong attempts
  OTP_BLOCKED: 'OTP_BLOCKED', // hard block (send + verify)

  // ⚠ legacy – do not use in new code
  OTP_ATTEMPTS_EXCEEDED: 'OTP_ATTEMPTS_EXCEEDED',

  /* ---------------- ACCOUNT ---------------- */
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  /* ---------------- SESSION ---------------- */
  SESSION_REVOKED: 'SESSION_REVOKED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',

  /* ---------------- REFRESH TOKEN ---------------- */
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_REUSED: 'REFRESH_TOKEN_REUSED',

  /* ---------------- MFA ---------------- */
  MFA_REQUIRED: 'MFA_REQUIRED',
  MFA_INVALID: 'MFA_INVALID',
} as const;

/**
 * Union of all auth error codes
 */
export type AuthErrorCode =
  (typeof AuthErrors)[keyof typeof AuthErrors];
