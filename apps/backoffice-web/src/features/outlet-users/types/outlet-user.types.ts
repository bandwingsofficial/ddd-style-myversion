export type OutletUserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface OutletUser {
  id: string;
  outletId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: OutletUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutletUserPayload {
  outletId: string;
  name: string;
  email: string;
  phone?: string;
  role: OutletUserRole;
  password: string;
}

export interface UpdateOutletUserPayload {
  name: string;
  phone?: string;
  role: OutletUserRole;
  outletId: string;
}

export interface OutletUserFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  password?: string;
  outletId?: string;
}

export const OUTLET_USER_ROLE_OPTIONS = [
  { value: 'ADMIN' as const, label: 'Admin' },
  { value: 'MANAGER' as const, label: 'Manager' },
  { value: 'STAFF' as const, label: 'Staff' },
];
