import { Unit as PrismaUnit } from '@prisma/client';
import { Unit } from '../domain/enums/unit.enum';

export class UnitMapper {
  static toDomain(unit: PrismaUnit): Unit {
    switch (unit) {
      case PrismaUnit.KG:
        return Unit.KG;

      case PrismaUnit.GRAM:
        return Unit.GRAM;

      case PrismaUnit.LITER:
        return Unit.LITER;

      case PrismaUnit.ML:
        return Unit.ML;

      case PrismaUnit.PIECE:
        return Unit.PIECE;

      case PrismaUnit.PACKET:
        return Unit.PACKET;

      default:
        throw new Error(
          `Unknown Prisma Unit: ${unit}`,
        );
    }
  }

  static toPrisma(unit: Unit): PrismaUnit {
    switch (unit) {
      case Unit.KG:
        return PrismaUnit.KG;

      case Unit.GRAM:
        return PrismaUnit.GRAM;

      case Unit.LITER:
        return PrismaUnit.LITER;

      case Unit.ML:
        return PrismaUnit.ML;

      case Unit.PIECE:
        return PrismaUnit.PIECE;

      case Unit.PACKET:
        return PrismaUnit.PACKET;

      default:
        throw new Error(
          `Unknown Domain Unit: ${unit}`,
        );
    }
  }
}
