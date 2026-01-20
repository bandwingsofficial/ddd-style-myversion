export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  name: string;
  subtitle: string;      // Added based on your screenshot
  imagePath?: string;    // Added based on your screenshot
  sortOrder: number;     // Added based on your screenshot
  status: CategoryStatus;
  isActive?: any;        // Kept for compatibility if you use it elsewhere
  createdAt: string;
  updatedAt: string;
}