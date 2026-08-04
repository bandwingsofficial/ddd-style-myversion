/** Payment window for PAYMENT_PENDING orders (10 minutes). */
export const PAYMENT_PENDING_TTL_MS = 10 * 60 * 1000;

export function computePaymentExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + PAYMENT_PENDING_TTL_MS);
}

export function computeRemainingSeconds(
  paymentExpiresAt: Date | null | undefined,
  now: Date = new Date(),
): number {
  if (!paymentExpiresAt) {
    return 0;
  }
  return Math.max(
    0,
    Math.floor((paymentExpiresAt.getTime() - now.getTime()) / 1000),
  );
}
