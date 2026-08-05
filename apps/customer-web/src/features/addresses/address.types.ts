export interface Address {
  id: string;
  customerId: string;
  type: "HOME" | "WORK" | "OTHER";
  label: string;
  addressText: string;
  houseNumber?: string | null;
  street?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  latitude: number;
  longitude: number;
  resolvedOutletId?: string | null;
  resolvedOutletName?: string | null;
  serviceable?: boolean;
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
  houseNumber?: string;
  street?: string;
  landmark?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}
