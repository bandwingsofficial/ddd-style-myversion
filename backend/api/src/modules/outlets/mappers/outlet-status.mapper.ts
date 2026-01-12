import { OutletStatus as PrismaOutletStatus } from '@prisma/client';
import { OutletStatus } from '../domain/enums/outlet-status.enum';

export class OutletStatusMapper {
  static toDomain(status: PrismaOutletStatus): OutletStatus {
    switch (status) {
      case PrismaOutletStatus.ACTIVE:
        return OutletStatus.ACTIVE;

      case PrismaOutletStatus.INACTIVE:
        return OutletStatus.INACTIVE;

      default:
        throw new Error(`Unknown Prisma OutletStatus: ${status}`);
    }
  }

  static toPrisma(status: OutletStatus): PrismaOutletStatus {
    switch (status) {
      case OutletStatus.ACTIVE:
        return PrismaOutletStatus.ACTIVE;

      case OutletStatus.INACTIVE:
        return PrismaOutletStatus.INACTIVE;

      default:
        throw new Error(`Unknown Domain OutletStatus: ${status}`);
    }
  }
}
