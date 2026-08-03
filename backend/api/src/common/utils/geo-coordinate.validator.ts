import { ValidationError } from '../errors';

export interface CoordinateValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateCoordinateRange(
  lat: number,
  lng: number,
): CoordinateValidationResult {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { valid: false, reason: 'NOT_FINITE' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, reason: 'LATITUDE_OUT_OF_RANGE' };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, reason: 'LONGITUDE_OUT_OF_RANGE' };
  }

  return { valid: true };
}

/**
 * Detects common data-entry corruption patterns for Bangalore service area.
 * Returns a warning code; does not reject coordinates by itself.
 */
export function detectCoordinateCorruption(
  lat: number,
  lng: number,
): string | null {
  const range = validateCoordinateRange(lat, lng);
  if (!range.valid) return range.reason ?? 'INVALID';

  if (lat > 20 && lng < 20) {
    return 'LIKELY_LAT_LNG_SWAPPED';
  }

  // Bangalore metro: latitude ~12.5–14, longitude must be ~77–78 (not 76.x)
  if (lat >= 12.5 && lat <= 14 && lng >= 76 && lng < 77) {
    return 'LIKELY_LONGITUDE_TYPO_76_INSTEAD_OF_77';
  }

  return null;
}

export function assertValidCustomerCoordinates(
  lat: number,
  lng: number,
): void {
  const result = validateCoordinateRange(lat, lng);
  if (!result.valid) {
    throw new ValidationError(
      'INVALID_COORDINATES',
      `Invalid customer coordinates: ${result.reason}`,
      { latitude: lat, longitude: lng },
    );
  }
}
