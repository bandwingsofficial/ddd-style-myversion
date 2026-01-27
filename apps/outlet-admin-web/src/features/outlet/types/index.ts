export interface Outlet {
  id: string;
  name: string;
  branch: string;
  status: "ACTIVE" | "INACTIVE";
  workingState: {
    status: "OPEN" | "CLOSED";
  };
  cameraState: {
    enabled: boolean;
    status: "ON" | "OFF";
    streamUrl?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  deliveryRadiusKm: number;
}

export interface OutletProduct {
  id: string;
  outletId: string;
  productId: string;
  isAvailable: boolean;
  priceOverride: number | null;
  discountOverride: number | null;
  // You might want to extend this with actual Product Name/Image if your API returns it, 
  // currently your JSON only has IDs.
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}