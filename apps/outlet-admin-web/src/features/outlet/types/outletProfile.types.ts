export interface OutletProfile {
  id: string;
  outletId: string;
  avatarUrl: string; // Changed from logoUrl
  bannerUrl: string;
  contactPhone: string;
  contactEmail: string;
  ownerName: string;
  description: string;
  gstNumber: string;
  fssaiNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutletProfilePayload {
  avatarUrl: string; // Changed from logoUrl
  bannerUrl: string;
  contactPhone: string;
  contactEmail: string;
  ownerName: string;
  description: string;
  gstNumber: string;
  fssaiNumber: string;
}

export type UpdateOutletProfilePayload = Partial<CreateOutletProfilePayload>;