export interface ProductListItem {
  id: string;
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
  unit?: {
    value: number;
    type: string;
  };
  tags?: string[];
  trendState?: {
    trending: boolean;
  };
  shortDescription?: string;
}

export interface ProductDetails {
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
  shortDescription: string;
  longDescription: string;
  tags: string[];
  status: "ACTIVE" | "INACTIVE";
  trendState: {
    trending: boolean;
  };
  unitValue?: number;
  unitType?: string;
}