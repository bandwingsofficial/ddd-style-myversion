import customerAxios from "@/http/axios/customerAxios";
import { NearbyOutlet, Outlet } from "../outlet.type";
import { traceCoordinates } from "@/features/location/utils/coordinate.utils";

export interface ResolvedDeliveryOutlet {
  outletId: string;
  outletName: string;
  distanceKm: number;
  outlet: Outlet;
}

export interface DeliveryOutletResolution {
  status: "NO_SERVICE" | "RESOLVED";
  resolvedOutlet: ResolvedDeliveryOutlet | null;
  nearbyOutlets: NearbyOutlet[];
}

export const getPublicOutlets = async (): Promise<Outlet[]> => {
  const res = await customerAxios.get("/public/outlets");
  return res.data.data;
};

export const getNearbyOutlets = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<NearbyOutlet[]> => {
  traceCoordinates({
    stage: "API_REQUEST",
    latitude,
    longitude,
    extra: { endpoint: "/public/outlets" },
  });

  const res = await customerAxios.get("/public/outlets", {
    params: {
      lat: latitude,
      lng: longitude,
    },
    signal,
  });

  const data = Array.isArray(res.data.data) ? res.data.data : [];

  return data
    .filter(
      (outlet: Outlet) =>
        typeof outlet.distanceKm === "number" &&
        Number.isFinite(outlet.distanceKm),
    )
    .map((outlet: Outlet) => ({
      ...outlet,
      distanceKm: outlet.distanceKm as number,
    }));
};

/** Backend-owned outlet resolution — single source of truth for delivery outlet. */
export const resolveDeliveryOutlet = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<DeliveryOutletResolution> => {
  traceCoordinates({
    stage: "API_REQUEST",
    latitude,
    longitude,
    extra: { endpoint: "/public/outlets/resolve" },
  });

  const res = await customerAxios.get("/public/outlets/resolve", {
    params: { lat: latitude, lng: longitude },
    signal,
  });

  return res.data.data as DeliveryOutletResolution;
};
