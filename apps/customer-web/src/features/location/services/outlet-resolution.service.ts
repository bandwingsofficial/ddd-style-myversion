import { getNearbyOutlets } from "@/features/outlet/api/outlet.api";
import {
  getOutletStatusLabel,
  isOutletOpen,
  NearbyOutlet,
  Outlet,
} from "@/features/outlet/outlet.type";
import { buildLocationKey } from "@/features/location/location.types";

export function sortServiceableOutlets(outlets: NearbyOutlet[]): NearbyOutlet[] {
  return [...outlets].sort((left, right) => {
    const distanceDiff = left.distanceKm - right.distanceKm;
    if (distanceDiff !== 0) return distanceDiff;

    const leftOpen = isOutletOpen(left) ? 0 : 1;
    const rightOpen = isOutletOpen(right) ? 0 : 1;
    if (leftOpen !== rightOpen) return leftOpen - rightOpen;

    return (
      estimateDeliveryMinutes(left.distanceKm) -
      estimateDeliveryMinutes(right.distanceKm)
    );
  });
}

export function estimateDeliveryMinutes(distanceKm: number): number {
  return Math.max(15, Math.round(15 + distanceKm * 3));
}

/** Auto-select the nearest open outlet; fallback to nearest if none open. */
export function pickAutoOutlet(
  serviceableOutlets: NearbyOutlet[],
): NearbyOutlet | null {
  if (serviceableOutlets.length === 0) return null;

  const sorted = sortServiceableOutlets(serviceableOutlets);
  return sorted.find((outlet) => isOutletOpen(outlet)) ?? sorted[0];
}

export function logOutletResolution(params: {
  latitude: number;
  longitude: number;
  addressLabel?: string;
  selectedOutlet: Outlet | null;
  serviceableCount: number;
  reason?: string;
}): void {
  if (process.env.NODE_ENV === "production") return;

  console.info("[outlet-resolution]", {
    customerLatitude: params.latitude,
    customerLongitude: params.longitude,
    detectedAddress: params.addressLabel ?? null,
    selectedOutletId: params.selectedOutlet?.id ?? null,
    selectedOutletName: params.selectedOutlet?.name ?? null,
    serviceableCount: params.serviceableCount,
    reason: params.reason ?? null,
  });
}

export async function resolveOutletForCoordinates(
  latitude: number,
  longitude: number,
  addressLabel?: string,
): Promise<{
  locationKey: string;
  serviceableOutlets: NearbyOutlet[];
  selectedOutlet: NearbyOutlet | null;
}> {
  const locationKey = buildLocationKey(latitude, longitude);
  const serviceableOutlets = sortServiceableOutlets(
    await getNearbyOutlets(latitude, longitude),
  );
  const selectedOutlet = pickAutoOutlet(serviceableOutlets);

  logOutletResolution({
    latitude,
    longitude,
    addressLabel,
    selectedOutlet,
    serviceableCount: serviceableOutlets.length,
    reason:
      serviceableOutlets.length === 0
        ? "NO_SERVICEABLE_OUTLETS"
        : selectedOutlet
          ? "AUTO_SELECTED"
          : "NO_OUTLET",
  });

  return { locationKey, serviceableOutlets, selectedOutlet };
}
