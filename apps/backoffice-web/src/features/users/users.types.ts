export interface OutletUser {
  id: string;
  outletId: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutletUserPayload {
  outletId: string;
  email: string;
  password: string;
  adminId: string;
}

// --- NEW TYPES ---
export interface OutletProduct {
  id: string; // The relationship ID
  outletId: string;
  productId: string;
  isAvailable: boolean;
  priceOverride: number | null;
  discountOverride: number | null;
  createdAt: string;
  updatedAt: string;
  // Optional: You usually need the product details (name, image) joined here.
  // If your backend doesn't return the name inside 'data', you might need to map it 
  // like we did in the Stock page.
  product?: {
    name: string;
    description?: string;
  }; 
}