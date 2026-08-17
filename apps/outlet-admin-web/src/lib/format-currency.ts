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

export function formatRupeeAmount(
  rupees?: number | null,
  options?: { decimals?: number },
): string {
  return formatCurrency(rupees, { decimals: options?.decimals ?? 2 });
}
