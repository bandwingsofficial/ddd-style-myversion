/**
 * Gateway payment amounts are stored in paise (smallest currency unit).
 * Order/revenue amounts from order.grandTotal are stored in rupees.
 */

export function paiseToRupees(paise: number | null | undefined): number {
  return (paise ?? 0) / 100;
}

export function formatCurrency(
  rupees?: number | null,
  options?: { decimals?: number },
): string {
  const decimals = options?.decimals ?? 0;
  const value = rupees ?? 0;

  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Format a Razorpay/gateway amount stored in paise as INR. */
export function formatPaymentAmount(paise?: number | null): string {
  return formatCurrency(paiseToRupees(paise), { decimals: 2 });
}

/** Format rupee amounts with optional decimal precision (KPIs, revenue). */
export function formatRupeeAmount(
  rupees?: number | null,
  options?: { decimals?: number },
): string {
  return formatCurrency(rupees, { decimals: options?.decimals ?? 2 });
}
