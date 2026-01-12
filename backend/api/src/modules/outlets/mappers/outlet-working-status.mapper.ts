// src/modules/outlets/mappers/outlet-working-status.mapper.ts

import { OutletWorkingStatus as PrismaOutletWorkingStatus } from '@prisma/client';
import { OutletWorkingStatus } from '../domain/enums/outlet-working-status.enum';

export class OutletWorkingStatusMapper {
  static toDomain(
    status: PrismaOutletWorkingStatus,
  ): OutletWorkingStatus {
    switch (status) {
      case PrismaOutletWorkingStatus.OPEN:
        return OutletWorkingStatus.OPEN;

      case PrismaOutletWorkingStatus.CLOSED:
        return OutletWorkingStatus.CLOSED;

      case PrismaOutletWorkingStatus.TEMPORARILY_CLOSED:
        return OutletWorkingStatus.TEMPORARILY_CLOSED;

      default:
        throw new Error(
          `Unknown Prisma OutletWorkingStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: OutletWorkingStatus,
  ): PrismaOutletWorkingStatus {
    switch (status) {
      case OutletWorkingStatus.OPEN:
        return PrismaOutletWorkingStatus.OPEN;

      case OutletWorkingStatus.CLOSED:
        return PrismaOutletWorkingStatus.CLOSED;

      case OutletWorkingStatus.TEMPORARILY_CLOSED:
        return PrismaOutletWorkingStatus.TEMPORARILY_CLOSED;

      default:
        throw new Error(
          `Unknown Domain OutletWorkingStatus: ${status}`,
        );
    }
  }
}
