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
  // Name can be string OR object
  name: string | { value: string };
  // Slug can be string OR object
  slug: string | { value: string };
  // Price can be number OR object with originalPrice/salePrice
  price: number | { originalPrice: number; salePrice?: number; value?: number };
  originalPrice?: number; // sometimes at root
  salePrice?: number;     // sometimes at root
  
  // Images can be string, array, or object
  images?: string[] | string | { url?: string; mainImage?: string; value?: string };
  image?: string | any; // fallback
  thumbnail?: string | any; // fallback

  unit?: string | { value: number; type: string };
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