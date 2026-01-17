// features/products/types/product.types.ts
export interface Product {
  id: string;
  stockItemId: string;
  name: { value: string };
  slug: { value: string };
  price: {
    originalPrice: number;
    discountPrice?: number;
  };
  images: {
    mainImage: string;
    galleryImages: string[];
  };
  shortDescription?: string;
  longDescription?: string;
  status: "ACTIVE" | "DISABLED";
  trendState: {
    trending: boolean;
  };
  createdAt: string;
  updatedAt: string;
}