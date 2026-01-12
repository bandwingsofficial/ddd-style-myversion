// src/modules/auth/constants/otp.constants.ts

export const OTP_CONSTANTS = {
  /* ---------------- OTP FORMAT ---------------- */
  CODE_LENGTH: 6,

  /* ---------------- OTP VALIDITY ---------------- */
  DEFAULT_TTL_SECONDS: 300, // OTP valid for 5 minutes

  /* ---------------- VERIFY RULES ---------------- */
  MAX_VERIFY_ATTEMPTS: 5, // wrong OTP attempts before block

  /* ---------------- SEND RULES ---------------- */
  RESEND_COOLDOWN_SECONDS: 60, // hard lock after sending OTP
  MAX_SEND_PER_HOUR: 10, // total OTP sends allowed per hour

  /* ---------------- BLOCKING ---------------- */
  BLOCK_DURATION_SECONDS: 3600, // 1 hour block after abuse
} as const;
