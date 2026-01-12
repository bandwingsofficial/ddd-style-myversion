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
