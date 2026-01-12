// src/modules/inventory/mappers/quantity.mapper.ts

import { Prisma } from '@prisma/client';
import { Quantity } from '../domain/value-objects/quantity.vo';

export class QuantityMapper {
  static toDomain(
    value: Prisma.Decimal,
  ): Quantity {
    return Quantity.create(value.toNumber());
  }

  static toPrisma(
    quantity: Quantity,
  ): Prisma.Decimal {
    return new Prisma.Decimal(quantity.getRaw());
  }
}
