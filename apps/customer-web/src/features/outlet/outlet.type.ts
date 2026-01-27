export interface OutletWorkingState {
  status: "OPEN" | "CLOSED";
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
}