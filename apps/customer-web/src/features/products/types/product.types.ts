// Define the complex shapes (Old Frontend Style)
export interface ProductPrice {
  originalPrice: number;
  discountPrice?: number;
}

export interface ProductImages {
  mainImage: string;
  galleryImages: string[];
}

export interface ProductUnit {
  value: number;
  type: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

// Common fields used in list and details
export interface ProductBase {
  id: string;

  // FIX: Accept String (Backend) OR Object (Legacy)
  name: string | { value: string };
  slug: string | { value: string };

  // FIX: Accept Number (Backend) OR Object (Legacy)
  price: number | ProductPrice;

  // FIX: Accept Array/String (Backend) OR Object (Legacy)
  images?: string[] | ProductImages | string;

  // FIX: Accept String (Backend) OR Object (Legacy)
  unit?: ProductUnit | string;
  
  tags?: string[];
  
  trendState?: {
    trending: boolean;
  };
  
  rating?: ProductRating;
  category?: ProductCategory;
  
  // Status is usually a simple string from backend
  status?: "ACTIVE" | "INACTIVE"; 
}

// The shape of a product in the list
export interface ProductListItem extends ProductBase {
  shortDescription?: string;
  description?: string; // Backend sometimes sends 'description' instead of 'shortDescription'
}

// The shape of a product in the details page
export interface ProductDetails extends ProductBase {
  shortDescription: string;
  longDescription: string;
}