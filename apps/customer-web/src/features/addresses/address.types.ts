export interface Address {
  id: string;
  customerId: string;
  type: "HOME" | "WORK" | "OTHER";
  label: string;
  addressText: string;
  latitude: number;
  longitude: number;
  resolvedOutletId?: string | null;
  isDeleted: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface AddressPayload {
  label?: string;
  type?: "HOME" | "WORK" | "OTHER";
  addressText: string;
  latitude: number;
  longitude: number;
}
