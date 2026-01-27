// src/modules/cart/mappers/cart-status.mapper.ts

import { CartStatus as PrismaCartStatus } from '@prisma/client';
import { CartStatus } from '../domain/enums/cart-status.enum';

export class CartStatusMapper {
  private static prismaToDomainMap: Record<
    PrismaCartStatus,
    CartStatus
  > = {
    ACTIVE: CartStatus.ACTIVE,
    LOCKED: CartStatus.LOCKED,
    EXPIRED: CartStatus.EXPIRED,
  };

  private static domainToPrismaMap: Record<
    CartStatus,
    PrismaCartStatus
  > = {
    [CartStatus.ACTIVE]: PrismaCartStatus.ACTIVE,
    [CartStatus.LOCKED]: PrismaCartStatus.LOCKED,
    [CartStatus.EXPIRED]: PrismaCartStatus.EXPIRED,
  };

  static toDomain(status: PrismaCartStatus): CartStatus {
    const mapped = this.prismaToDomainMap[status];

    if (!mapped) {
      throw new Error(`Unknown Prisma CartStatus: ${status}`);
    }

    return mapped;
  }

  static toPrisma(status: CartStatus): PrismaCartStatus {
    const mapped = this.domainToPrismaMap[status];

    if (!mapped) {
      throw new Error(`Unknown Domain CartStatus: ${status}`);
    }

    return mapped;
  }
}
