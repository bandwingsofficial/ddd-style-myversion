// src/modules/outlets/domain/value-objects/outlet-working-state.vo.ts

import { OutletWorkingStatus } from '../enums/outlet-working-status.enum';

export class OutletWorkingState {
  private readonly status: OutletWorkingStatus;

  private constructor(status: OutletWorkingStatus) {
    this.status = status;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static open(): OutletWorkingState {
    return new OutletWorkingState(OutletWorkingStatus.OPEN);
  }

  static close(): OutletWorkingState {
    return new OutletWorkingState(OutletWorkingStatus.CLOSED);
  }

  static temporarilyClosed(): OutletWorkingState {
    return new OutletWorkingState(
      OutletWorkingStatus.TEMPORARILY_CLOSED,
    );
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isOpen(): boolean {
    return this.status === OutletWorkingStatus.OPEN;
  }

  isClosed(): boolean {
    return this.status === OutletWorkingStatus.CLOSED;
  }

  isTemporarilyClosed(): boolean {
    return this.status === OutletWorkingStatus.TEMPORARILY_CLOSED;
  }

  canAcceptOrders(): boolean {
    return this.isOpen();
  }

  /* ---------------------------------------------- */
  /* COMPARISON                                     */
  /* ---------------------------------------------- */

  equals(other?: OutletWorkingState): boolean {
    if (!other) return false;
    return this.status === other.status;
  }

  /* ---------------------------------------------- */
  /* PERSISTENCE ONLY                               */
  /* ---------------------------------------------- */

  getRaw(): OutletWorkingStatus {
    return this.status;
  }
}
