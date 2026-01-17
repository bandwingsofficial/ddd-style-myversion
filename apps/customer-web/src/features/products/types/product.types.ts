export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  isTrending: boolean;
  mainImage: string;
}

export interface ProductDetails {
  id: string;
  stockItemId: string;
  name: { value: string };
  slug: { value: string };
  price: { originalPrice: number };
  images: {
    mainImage: string;
    galleryImages: string[];
  };
  status: "ACTIVE" | "INACTIVE";
  trendState: {
    trending: boolean;
  };
}
