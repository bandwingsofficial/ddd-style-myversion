import { CentralInventory } from '../domain/models/central-inventory.model';
import { Quantity } from '../domain/value-objects/quantity.vo';
import { ValidationError } from '../../../common/errors';

export class InventoryAdjustPolicy {
  static ensure(
    inventory: CentralInventory,
    newAvailableQty: Quantity,
  ): void {
    if (
      newAvailableQty.getRaw() >
      inventory.totalQty.getRaw()
    ) {
      throw new ValidationError(
        'INVALID_STOCK_ADJUSTMENT',
        'Available stock cannot exceed total stock',
        {
          available: newAvailableQty.getRaw(),
          total: inventory.totalQty.getRaw(),
        },
      );
    }
  }
}
