export class OutletUserResponseDto {
  id: string;
  outletId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
