export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  isActive: any;
  id: string;
  name: string;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
