import { SavedAddressType as PrismaSavedAddressType } from '@prisma/client';
import { SavedAddressType } from '../domain/enums/saved-address-type.enum';

export class SavedAddressTypeMapper {
  static toDomain(
    type: PrismaSavedAddressType,
  ): SavedAddressType {
    switch (type) {
      case PrismaSavedAddressType.HOME:
        return SavedAddressType.HOME;

      case PrismaSavedAddressType.WORK:
        return SavedAddressType.WORK;

      case PrismaSavedAddressType.OTHER:
        return SavedAddressType.OTHER;

      default:
        throw new Error(
          `Unknown Prisma SavedAddressType: ${type}`,
        );
    }
  }

  static toPrisma(
    type: SavedAddressType,
  ): PrismaSavedAddressType {
    switch (type) {
      case SavedAddressType.HOME:
        return PrismaSavedAddressType.HOME;

      case SavedAddressType.WORK:
        return PrismaSavedAddressType.WORK;

      case SavedAddressType.OTHER:
        return PrismaSavedAddressType.OTHER;

      default:
        throw new Error(
          `Unknown Domain SavedAddressType: ${type}`,
        );
    }
  }
}
