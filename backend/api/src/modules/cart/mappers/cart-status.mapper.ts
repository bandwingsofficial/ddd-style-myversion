// src/modules/cart/mappers/cart-status.mapper.ts

import { CartStatus as PrismaCartStatus } from '@prisma/client';
import { CartStatus } from '../domain/enums/cart-status.enum';

export class CartStatusMapper {
  static toDomain(
    status: PrismaCartStatus,
  ): CartStatus {
    switch (status) {
      case PrismaCartStatus.ACTIVE:
        return CartStatus.ACTIVE;

      case PrismaCartStatus.LOCKED:
        return CartStatus.LOCKED;

      case PrismaCartStatus.EXPIRED:
        return CartStatus.EXPIRED;

      default:
        throw new Error(
          `Unknown Prisma CartStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: CartStatus,
  ): PrismaCartStatus {
    switch (status) {
      case CartStatus.ACTIVE:
        return PrismaCartStatus.ACTIVE;

      case CartStatus.LOCKED:
        return PrismaCartStatus.LOCKED;

      case CartStatus.EXPIRED:
        return PrismaCartStatus.EXPIRED;

      default:
        throw new Error(
          `Unknown Domain CartStatus: ${status}`,
        );
    }
  }
}
