import customerAxios from "@/http/axios/customerAxios";
import { NearbyOutlet, Outlet } from "../outlet.type";
import { traceCoordinates } from "@/features/location/utils/coordinate.utils";

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
