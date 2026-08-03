export interface ProductPrice {
  originalPrice: number;
  discountPrice?: number | null;
}

export interface ProductImages {
  mainImageUrl: string;
  galleryImageUrls: string[];
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

export interface ProductBase {
  id: string;
  name: string | { value: string };
  slug: string | { value: string };
  price: number | ProductPrice;
  images?: ProductImages;
  unit?: ProductUnit | string;
  tags?: string[];
  trendState?: {
    trending: boolean;
  };
  rating?: ProductRating;
  category?: ProductCategory;
  status?: "ACTIVE" | "INACTIVE";
  outletId?: string;
  outletName?: string;
  outlet?: {
    id: string;
    name?: string;
  };
}

export interface ProductListItem extends ProductBase {
  shortDescription?: string;
  description?: string;
}

export interface ProductDetails extends ProductBase {
  shortDescription: string;
  longDescription: string;
}

export interface ProductSlugPageResponse {
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  product: ProductDetails | null;
  relatedProducts: ProductListItem[];
  message?: string;
}

export interface ProductsUpdatedSocketPayload {
  version: number;
  products: ProductListItem[];
}
