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
  name: { value: string };
  slug: { value: string };
  price: ProductPrice;
  images: ProductImages;
  unit?: ProductUnit;
  tags?: string[];
  trendState?: {
    trending: boolean;
  };
  rating?: ProductRating;
  category?: ProductCategory;
}

// The shape of a product in the list
export interface ProductListItem extends ProductBase {
  shortDescription?: string;
}

// The shape of a product in the details page
export interface ProductDetails extends ProductBase {
  shortDescription: string;
  longDescription: string;
  status?: "ACTIVE" | "INACTIVE"; // kept optional if backend sends it
}