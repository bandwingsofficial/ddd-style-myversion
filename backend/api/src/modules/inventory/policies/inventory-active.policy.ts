import { CentralInventory } from '../domain/models/central-inventory.model';
import { ValidationError } from '../../../common/errors';

export class InventoryActivePolicy {
  static ensure(inventory: CentralInventory): void {
    if (!inventory.isActive()) {
      throw new ValidationError(
        'INVENTORY_INACTIVE',
        'Inventory is inactive and cannot be used',
        {
          inventoryId: inventory.id,
        },
      );
    }
  }
}
