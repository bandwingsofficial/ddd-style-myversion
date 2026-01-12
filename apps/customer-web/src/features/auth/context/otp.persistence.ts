
// features/auth/customer/context/otp.persistence.ts

import type { OtpState } from '../types/otp.types';

const STORAGE_KEY = 'customer:otp:state';

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

function isExpired(state: OtpState): boolean {
  if (!state.expiresAt) return false;

  const expiresAt = new Date(state.expiresAt).getTime();
  return Date.now() > expiresAt;
}

/* -------------------------------------------------------
 * Load OTP state from sessionStorage
 * ----------------------------------------------------- */
export function loadOtpState(): OtpState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as OtpState;

    if (isExpired(parsed)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------
 * Save OTP state to sessionStorage
 * ----------------------------------------------------- */
export function saveOtpState(state: OtpState): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Ignore quota / serialization errors
  }
}

/* -------------------------------------------------------
 * Clear OTP state from sessionStorage
 * ----------------------------------------------------- */
export function clearOtpState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
