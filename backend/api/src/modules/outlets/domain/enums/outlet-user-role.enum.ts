export enum OutletUserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export const OUTLET_USER_ROLE_OPTIONS = [
  { value: OutletUserRole.ADMIN, label: 'Admin' },
  { value: OutletUserRole.MANAGER, label: 'Manager' },
  { value: OutletUserRole.STAFF, label: 'Staff' },
] as const;
