// src/features/outlet/types/index.ts

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

// ✅ 1. Flexible Product Shape (Matches Customer App)
export interface ProductDetails {
  id: string;
  name: string | { value: string };
  slug?: string | { value: string };
  price?: {
    originalPrice: number;
    discountPrice?: number | null;
  };
  images?: {
    mainImageUrl?: string;
    galleryImageUrls?: string[];
  };
  unit?: {
    value: number;
    type: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

// ✅ 2. The Main Outlet Product Type
export interface OutletProduct {
  id: string;        // The relationship ID
  outletId: string;
  productId: string;
  isAvailable: boolean;
  
  // This is the nested data we will merge or fetch
  product?: ProductDetails; 
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}