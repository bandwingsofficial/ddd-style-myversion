export interface OutletWorkingState {
  status: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED" | "BUSY";
}

export interface OutletLocation {
  latitude: number;
  longitude: number;
}

export interface Outlet {
  id: string;
  name: string;
  branch: string;
  status: "ACTIVE" | "INACTIVE";
  workingState: OutletWorkingState;
  location: OutletLocation;
  deliveryRadiusKm: number;
  isCentral: boolean;
  distanceKm?: number;
}

export type NearbyOutlet = Outlet & {
  distanceKm: number;
};

export function isOutletOpen(outlet: Outlet): boolean {
  return outlet.workingState?.status === "OPEN";
}

export function getOutletStatusLabel(outlet: Outlet): string {
  const status = outlet.workingState?.status ?? "CLOSED";
  if (status === "OPEN") return "Open";
  if (status === "TEMPORARILY_CLOSED") return "Closed";
  if (status === "BUSY") return "Busy";
  return "Closed";
}
