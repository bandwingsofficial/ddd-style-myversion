import { CustomerAddress } from '../types';

export function hasDeliveryCoordinates(
  address?: CustomerAddress | null,
): address is CustomerAddress & { latitude: number; longitude: number } {
  if (!address) return false;

  const { latitude, longitude } = address;
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  );
}

export function buildGoogleMapsDirectionsUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function openGoogleMapsDirections(
  latitude: number,
  longitude: number,
): void {
  window.open(buildGoogleMapsDirectionsUrl(latitude, longitude), '_blank', 'noopener,noreferrer');
}
