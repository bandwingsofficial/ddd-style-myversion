// features/products/types/product.types.ts
export interface Product {
  id: string;
  categoryId: string; // New
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
  unitValue: number; // New
  unitType: string;  // New (e.g., LTR, KG)
  tags: string[];    // New
  shortDescription?: string;
  longDescription?: string;
  status: "ACTIVE" | "DISABLED";
  trendState: {
    trending: boolean;
  };
  ratingAverage?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}