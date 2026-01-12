// src/modules/outlets/mappers/camera-status.mapper.ts

import { CameraStatus as PrismaCameraStatus } from '@prisma/client';
import { CameraStatus } from '../domain/enums/camera-status.enum';

export class CameraStatusMapper {
  static toDomain(
    status: PrismaCameraStatus,
  ): CameraStatus {
    switch (status) {
      case PrismaCameraStatus.OFF:
        return CameraStatus.OFF;

      case PrismaCameraStatus.ON:
        return CameraStatus.ON;

      case PrismaCameraStatus.MAINTENANCE:
        return CameraStatus.MAINTENANCE;

      default:
        throw new Error(
          `Unknown Prisma CameraStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: CameraStatus,
  ): PrismaCameraStatus {
    switch (status) {
      case CameraStatus.OFF:
        return PrismaCameraStatus.OFF;

      case CameraStatus.ON:
        return PrismaCameraStatus.ON;

      case CameraStatus.MAINTENANCE:
        return PrismaCameraStatus.MAINTENANCE;

      default:
        throw new Error(
          `Unknown Domain CameraStatus: ${status}`,
        );
    }
  }
}
