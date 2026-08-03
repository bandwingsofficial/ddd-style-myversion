import { getNearbyOutlets } from "@/features/outlet/api/outlet.api";
import {
  getOutletStatusLabel,
  isOutletOpen,
  NearbyOutlet,
  Outlet,
} from "@/features/outlet/outlet.type";
import { buildLocationKey } from "@/features/location/location.types";

export interface OutletResolutionContext {
  latitude: number;
  longitude: number;
  addressLabel?: string;
}

export interface OutletResolutionResult {
  locationKey: string;
  serviceableOutlets: NearbyOutlet[];
  selectedOutlet: NearbyOutlet | null;
  shouldPromptSelection: boolean;
  rejectionReason?: string;
}

export function sortServiceableOutlets(outlets: NearbyOutlet[]): NearbyOutlet[] {
  return [...outlets].sort((left, right) => {
    const distanceDiff = left.distanceKm - right.distanceKm;
    if (distanceDiff !== 0) return distanceDiff;

    const leftOpen = isOutletOpen(left) ? 0 : 1;
    const rightOpen = isOutletOpen(right) ? 0 : 1;
    if (leftOpen !== rightOpen) return leftOpen - rightOpen;

    return estimateDeliveryMinutes(left.distanceKm) -
      estimateDeliveryMinutes(right.distanceKm);
  });
}

export function estimateDeliveryMinutes(distanceKm: number): number {
  return Math.max(15, Math.round(15 + distanceKm * 3));
}

export function logOutletResolution(params: {
  context: OutletResolutionContext;
  serviceableOutlets: NearbyOutlet[];
  selectedOutlet: Outlet | null;
  reason?: string;
}): void {
  if (process.env.NODE_ENV === "production") return;

  console.info("[outlet-resolution]", {
    customerLatitude: params.context.latitude,
    customerLongitude: params.context.longitude,
    detectedAddress: params.context.addressLabel ?? null,
    selectedOutletId: params.selectedOutlet?.id ?? null,
    selectedOutletName: params.selectedOutlet?.name ?? null,
    serviceableCount: params.serviceableOutlets.length,
    outlets: params.serviceableOutlets.map((outlet) => ({
      id: outlet.id,
      name: outlet.name,
      distanceKm: outlet.distanceKm,
      deliveryRadiusKm: outlet.deliveryRadiusKm,
      status: getOutletStatusLabel(outlet),
      serviceable: true,
    })),
    reason: params.reason ?? null,
  });
}

export async function resolveOutletsForCoordinates(
  latitude: number,
  longitude: number,
  addressLabel?: string,
): Promise<OutletResolutionResult> {
  const locationKey = buildLocationKey(latitude, longitude);
  const serviceableOutlets = sortServiceableOutlets(
    await getNearbyOutlets(latitude, longitude),
  );

  if (serviceableOutlets.length === 0) {
    logOutletResolution({
      context: { latitude, longitude, addressLabel },
      serviceableOutlets,
      selectedOutlet: null,
      reason: "NO_SERVICEABLE_OUTLETS",
    });

    return {
      locationKey,
      serviceableOutlets,
      selectedOutlet: null,
      shouldPromptSelection: false,
      rejectionReason: "NO_SERVICEABLE_OUTLETS",
    };
  }

  if (serviceableOutlets.length === 1) {
    const selectedOutlet = serviceableOutlets[0];

    logOutletResolution({
      context: { latitude, longitude, addressLabel },
      serviceableOutlets,
      selectedOutlet,
      reason: "AUTO_SELECTED_SINGLE_OUTLET",
    });

    return {
      locationKey,
      serviceableOutlets,
      selectedOutlet,
      shouldPromptSelection: false,
    };
  }

  logOutletResolution({
    context: { latitude, longitude, addressLabel },
    serviceableOutlets,
    selectedOutlet: null,
    reason: "MULTIPLE_OUTLETS_REQUIRE_SELECTION",
  });

  return {
    locationKey,
    serviceableOutlets,
    selectedOutlet: null,
    shouldPromptSelection: true,
  };
}

export function pickOutletForLocationChange(params: {
  serviceableOutlets: NearbyOutlet[];
  currentOutlet: Outlet | null;
  manuallySelected: boolean;
}): {
  selectedOutlet: NearbyOutlet | null;
  shouldPromptSelection: boolean;
} {
  const { serviceableOutlets, currentOutlet, manuallySelected } = params;

  if (serviceableOutlets.length === 0) {
    return { selectedOutlet: null, shouldPromptSelection: false };
  }

  if (serviceableOutlets.length === 1) {
    return {
      selectedOutlet: serviceableOutlets[0],
      shouldPromptSelection: false,
    };
  }

  if (currentOutlet) {
    const stillServiceable = serviceableOutlets.find(
      (outlet) => outlet.id === currentOutlet.id,
    );

    if (stillServiceable && manuallySelected) {
      return {
        selectedOutlet: stillServiceable,
        shouldPromptSelection: false,
      };
    }

    if (stillServiceable && isOutletOpen(stillServiceable)) {
      return {
        selectedOutlet: stillServiceable,
        shouldPromptSelection: false,
      };
    }
  }

  const nearestOpen =
    serviceableOutlets.find((outlet) => isOutletOpen(outlet)) ??
    serviceableOutlets[0];

  return {
    selectedOutlet: nearestOpen,
    shouldPromptSelection: true,
  };
}
