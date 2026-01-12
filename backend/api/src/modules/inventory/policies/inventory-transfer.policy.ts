import { CentralInventory } from '../domain/models/central-inventory.model';
import { Quantity } from '../domain/value-objects/quantity.vo';
import { ValidationError } from '../../../common/errors';

export class InventoryTransferPolicy {
  static ensure(
    inventory: CentralInventory,
    quantity: Quantity,
  ): void {
    if (!inventory.canTransfer(quantity)) {
      throw new ValidationError(
        'INSUFFICIENT_STOCK',
        'Not enough stock available for transfer',
        {
          available: inventory.availableQty.getRaw(),
          requested: quantity.getRaw(),
        },
      );
    }
  }
}
