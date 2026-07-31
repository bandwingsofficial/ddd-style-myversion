import { OutletFormErrors } from '../types/outlet.types';

export { getApiErrorMessage, UNEXPECTED_ERROR_TOAST } from '@/lib/api-error';

export const formInputClassName = (hasError = false) =>
  `h-12 w-full rounded-xl border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-4 ${
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
      : 'border-input focus:border-primary focus:ring-primary/10'
  }`;

export function validateOutletName(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Outlet name is required.';
  }

  if (trimmed.length < 2) {
    return 'Outlet name must be at least 2 characters.';
  }

  return undefined;
}

export function validateOutletAddress(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Address is required.';
  }

  if (trimmed.length < 5) {
    return 'Address must be at least 5 characters.';
  }

  return undefined;
}

export function validateOutletPincode(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Pincode is required.';
  }

  if (trimmed.length < 6) {
    return 'Pincode must be at least 6 characters.';
  }

  return undefined;
}

export function validateCoordinate(
  value: string,
  label: string,
): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${label} is required.`;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return `${label} must be a valid number.`;
  }

  return undefined;
}

export function validateDeliveryRadius(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Delivery radius is required.';
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 'Delivery radius must be greater than zero.';
  }

  return undefined;
}

export function validateCameraStreamUrl(
  value: string,
  required: boolean,
): string | undefined {
  const trimmed = value.trim();

  if (!required) {
    return undefined;
  }

  if (!trimmed) {
    return 'Camera stream URL is required when camera is enabled.';
  }

  if (!/^(rtsp|rtsps|http|https):\/\/.+$/i.test(trimmed)) {
    return 'Stream URL must start with rtsp://, rtsps://, http://, or https://';
  }

  return undefined;
}

export function mapServerFieldErrors(
  data?: { errors?: Record<string, string> },
): OutletFormErrors {
  if (!data?.errors) {
    return {};
  }

  return {
    name: data.errors.name,
    branch: data.errors.branch,
    address: data.errors.address,
    pincode: data.errors.pincode,
    latitude: data.errors.latitude,
    longitude: data.errors.longitude,
    deliveryRadiusKm: data.errors.deliveryRadiusKm,
    cameraStreamUrl: data.errors.cameraStreamUrl,
  };
}

export function getOutletStreamUrl(outlet: {
  cameraState?: { streamUrl?: string; cameraStreamUrl?: string };
}): string | undefined {
  return (
    outlet.cameraState?.streamUrl ?? outlet.cameraState?.cameraStreamUrl
  );
}
