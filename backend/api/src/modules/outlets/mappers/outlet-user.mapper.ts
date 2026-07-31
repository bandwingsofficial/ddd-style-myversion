import { OutletUser } from '../domain/models/outlet-user.model';
import { OutletUserResponseDto } from '../dtos/outlet-user-response.dto';

export function toOutletUserResponse(user: OutletUser): OutletUserResponseDto {
  return {
    id: user.id,
    outletId: user.outletId,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toOutletUserResponseList(
  users: OutletUser[],
): OutletUserResponseDto[] {
  return users.map(toOutletUserResponse);
}
