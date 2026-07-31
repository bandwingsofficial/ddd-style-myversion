export type OutletStatus = 'ACTIVE' | 'INACTIVE';

export type WorkingStatus = 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';

export type CameraStatus = 'ON' | 'OFF' | 'MAINTENANCE';

export interface OutletWorkingState {
  status: WorkingStatus;
}

export interface OutletCameraState {
  enabled?: boolean;
  status: CameraStatus;
  streamUrl?: string;
  cameraStreamUrl?: string;
}

export interface OutletLocation {
  latitude?: number;
  longitude?: number;
}

export interface Outlet {
  id: string;
  name: string;
  branch?: string;
  address?: string;
  pincode?: string;
  status: OutletStatus;
  workingState: OutletWorkingState;
  cameraState: OutletCameraState;
  location?: OutletLocation;
  deliveryRadiusKm?: number;
  isCentral: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOutletPayload {
  name: string;
  branch?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
  cameraEnabled?: boolean;
  cameraStreamUrl?: string;
  isCentral?: boolean;
}

export interface UpdateOutletPayload {
  name: string;
  branch?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
}

export type OutletStatusFilter = 'ALL' | OutletStatus;

export type OutletWorkingFilter = 'ALL' | WorkingStatus;

export interface OutletFormErrors {
  name?: string;
  branch?: string;
  address?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
  deliveryRadiusKm?: string;
  cameraStreamUrl?: string;
}
