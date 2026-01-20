export interface ProductListItem {
  id: string;
  // Handle simple strings OR DDD Value Objects
  name: string | { value: string };
  slug: string | { value: string };
  // Handle simple numbers OR Price Objects
  price: number | { originalPrice: number; discountPrice: number } | { value: number };
  originalPrice?: number;
  isTrending: boolean;
  mainImage?: string;
}

export interface ProductDetails {
  id: string;
  stockItemId: string;
  name: { value: string };
  slug: { value: string };
  price: { originalPrice: number; discountPrice?: number };
  images: {
    mainImage: string;
    galleryImages: string[];
  };
  status: "ACTIVE" | "INACTIVE";
  trendState: {
    trending: boolean;
  };
}