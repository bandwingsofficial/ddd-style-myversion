/** Estimated delivery time from outlet distance (display only). */
export function estimateDeliveryMinutes(distanceKm: number): number {
  return Math.max(15, Math.round(15 + distanceKm * 3));
}
