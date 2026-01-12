export type WorkingStatus = "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED";

export interface Outlet {
  [x: string]: any;
  id: string;
  name: string;
  branch?: string;
  status: "ACTIVE" | "INACTIVE";
  workingState: {
    status: WorkingStatus;
  };
  cameraState: {
    enabled: boolean;
    status: "ON" | "OFF";
  };
  deliveryRadiusKm?: number;
  isCentral: boolean;
}
export interface OutletUser {
  id: string;
  outletId: string;
  email: string;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

