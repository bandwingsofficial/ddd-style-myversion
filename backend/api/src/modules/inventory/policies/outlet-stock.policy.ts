import { OutletStock } from '../domain/models/outlet-stock.model';
import { Quantity } from '../domain/value-objects/quantity.vo';
import { ValidationError } from '../../../common/errors';

export class OutletStockPolicy {
  static ensureCanRemove(
    outletStock: OutletStock,
    quantity: Quantity,
  ): void {
    if (
      outletStock.quantity.getRaw() <
      quantity.getRaw()
    ) {
      throw new ValidationError(
        'OUTLET_INSUFFICIENT_STOCK',
        'Outlet does not have enough stock',
        {
          available: outletStock.quantity.getRaw(),
          requested: quantity.getRaw(),
        },
      );
    }
  }
}
