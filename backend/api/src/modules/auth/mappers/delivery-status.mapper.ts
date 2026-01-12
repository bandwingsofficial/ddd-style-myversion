// src/modules/auth/repositories/mappers/delivery-status.mapper.ts

import { DeliveryStatus as PrismaDeliveryStatus } from '@prisma/client';
import { DeliveryStatus as DomainDeliveryStatus } from '../domain/enums/delivery-status.enum';

export class DeliveryStatusMapper {
  static toPrisma(status: DomainDeliveryStatus): PrismaDeliveryStatus {
    switch (status) {
      case DomainDeliveryStatus.CREATED:
        return PrismaDeliveryStatus.CREATED;
      case DomainDeliveryStatus.KYC_SUBMITTED:
        return PrismaDeliveryStatus.KYC_SUBMITTED;
      case DomainDeliveryStatus.APPROVED:
        return PrismaDeliveryStatus.APPROVED;
      case DomainDeliveryStatus.SUSPENDED:
        return PrismaDeliveryStatus.SUSPENDED;
      case DomainDeliveryStatus.BLOCKED:
        return PrismaDeliveryStatus.BLOCKED;
      default:
        throw new Error(`Unknown DeliveryStatus: ${status}`);
    }
  }

  static toDomain(status: PrismaDeliveryStatus): DomainDeliveryStatus {
    switch (status) {
      case PrismaDeliveryStatus.CREATED:
        return DomainDeliveryStatus.CREATED;
      case PrismaDeliveryStatus.KYC_SUBMITTED:
        return DomainDeliveryStatus.KYC_SUBMITTED;
      case PrismaDeliveryStatus.APPROVED:
        return DomainDeliveryStatus.APPROVED;
      case PrismaDeliveryStatus.SUSPENDED:
        return DomainDeliveryStatus.SUSPENDED;
      case PrismaDeliveryStatus.BLOCKED:
        return DomainDeliveryStatus.BLOCKED;
      default:
        throw new Error(`Unknown Prisma DeliveryStatus: ${status}`);
    }
  }
}
