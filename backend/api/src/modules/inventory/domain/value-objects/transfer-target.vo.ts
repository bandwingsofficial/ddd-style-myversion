// src/modules/inventory/domain/value-objects/transfer-target.vo.ts

import { ValidationError } from '../../../../common/errors';

export class TransferTarget {
  private readonly outletId: string;

  private constructor(outletId: string) {
    this.outletId = outletId;
    Object.freeze(this);
  }

  static toOutlet(outletId: string): TransferTarget {
    if (!outletId) {
      throw new ValidationError(
        'INVALID_OUTLET',
        'Outlet is required for transfer',
      );
    }

    return new TransferTarget(outletId);
  }

  getOutletId(): string {
    return this.outletId;
  }
}
