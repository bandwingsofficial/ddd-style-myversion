// features/products/types/product.types.ts

export interface ProductGalleryImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  stockItemId: string;
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
  status: "ACTIVE" | "INACTIVE" | "DISABLED";
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

export interface ProductsUpdatedSocketPayload {
  version: number;
  products: unknown[];
}
