export type ProductStatus =
  | 'ACTIVE'
  | 'OUT_OF_STOCK'
  | 'INACTIVE'
  | 'ARCHIVED'
  | 'SOFT_DELETED';

export type ProductDeleteOutcome = 'PERMANENT' | 'ARCHIVED';

export interface Product {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: { value: string };
  slug: { value: string };
  price: {
    originalPrice: number;
    discountPrice?: number | null;
  };
  images: {
    mainImageUrl: string;
    galleryImages: ProductGalleryImage[];
  };
  unitValue: number;
  unitType: string;
  tags: string[];
  shortDescription?: string;
  longDescription?: string;
  ingredients?: string;
  benefits?: string;
  extraInfo1?: string;
  extraInfo2?: string;
  status: ProductStatus;
  trendState: {
    trending: boolean;
  };
  featuredState?: {
    featured: boolean;
  };
  ratingAverage?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFormErrors {
  categoryId?: string;
  productName?: string;
  originalPrice?: string;
  discountPrice?: string;
  unitValue?: string;
  unitType?: string;
  mainImage?: string;
}

export interface ProductsUpdatedSocketPayload {
  version: number;
  products: unknown[];
}

export const PRODUCT_TAGS = [
  'FRESH',
  'ORGANIC',
  'NO_SUGAR',
  'COLD_PRESSED',
  'NATURAL',
  'FARM_FRESH',
  'PRESERVATIVE_FREE',
  'VEGAN',
] as const;

export const UNIT_TYPES = ['PCS', 'KG', 'LTR', 'GM', 'ML'] as const;

export type ProductTag = (typeof PRODUCT_TAGS)[number];
