import { UnitType as PrismaUnitType } from '@prisma/client';
import { UnitType } from '../domain/enums/unit-type.enum';

export class UnitTypeMapper {
  static toDomain(
    unit: PrismaUnitType,
  ): UnitType {
    switch (unit) {
      case PrismaUnitType.ML:
        return UnitType.ML;

      case PrismaUnitType.LTR:
        return UnitType.LTR;

      case PrismaUnitType.G:
        return UnitType.G;

      case PrismaUnitType.KG:
        return UnitType.KG;

      case PrismaUnitType.PCS:
        return UnitType.PCS;

      default:
        throw new Error(
          `Unknown Prisma UnitType: ${unit}`,
        );
    }
  }

  static toPrisma(
    unit: UnitType,
  ): PrismaUnitType {
    switch (unit) {
      case UnitType.ML:
        return PrismaUnitType.ML;

      case UnitType.LTR:
        return PrismaUnitType.LTR;

      case UnitType.G:
        return PrismaUnitType.G;

      case UnitType.KG:
        return PrismaUnitType.KG;

      case UnitType.PCS:
        return PrismaUnitType.PCS;

      default:
        throw new Error(
          `Unknown Domain UnitType: ${unit}`,
        );
    }
  }
}
