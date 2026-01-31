import { ValidationError } from '../../../../common/errors';

import { DeliveryStatus } from '../enums/delivery-status.enum';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface DeliveryProps {
  id: string;

  orderId: string;
  partnerId: string;

  status: DeliveryStatus;

  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY (AGGREGATE ROOT)                        */
/* ---------------------------------------------- */

export class Delivery {
  readonly id: string;

  readonly orderId: string;
  readonly partnerId: string;

  readonly status: DeliveryStatus;

  readonly assignedAt: Date;
  readonly pickedUpAt?: Date;
  readonly deliveredAt?: Date;
  readonly failedAt?: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;


  /* ---------------------------------------------- */
  /* CONSTRUCTOR (PRIVATE)                          */
  /* ---------------------------------------------- */

  private constructor(props: DeliveryProps) {
    Object.assign(this, props);

    this.assertValidState();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    orderId: string;
    partnerId: string;
    now?: Date;
  }): Delivery {
    const now = params.now ?? new Date();

    return new Delivery({
      id: params.id,
      orderId: params.orderId,
      partnerId: params.partnerId,

      status: DeliveryStatus.ASSIGNED,

      assignedAt: now,

      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isAssigned(): boolean {
    return this.status === DeliveryStatus.ASSIGNED;
  }

  isPickedUp(): boolean {
    return this.status === DeliveryStatus.PICKED_UP;
  }

  isInTransit(): boolean {
    return this.status === DeliveryStatus.IN_TRANSIT;
  }

  isDelivered(): boolean {
    return this.status === DeliveryStatus.DELIVERED;
  }

  isFailed(): boolean {
    return this.status === DeliveryStatus.FAILED;
  }

  isFinal(): boolean {
    return [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED].includes(
      this.status,
    );
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS (STRICT STATE MACHINE)       */
  /* ---------------------------------------------- */

  /* 🔥 rider picked order */

  markPickedUp(now = new Date()): Delivery {
    if (this.status !== DeliveryStatus.ASSIGNED) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Cannot pick up delivery',
      );
    }

    return new Delivery({
      ...this,
      status: DeliveryStatus.PICKED_UP,
      pickedUpAt: now,
      updatedAt: now,
    });
  }

  /* 🔥 rider started trip */

  markInTransit(now = new Date()): Delivery {
    if (this.status !== DeliveryStatus.PICKED_UP) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Cannot start transit',
      );
    }

    return new Delivery({
      ...this,
      status: DeliveryStatus.IN_TRANSIT,
      updatedAt: now,
    });
  }

  /* 🔥 delivered successfully */

  markDelivered(now = new Date()): Delivery {
    if (this.status !== DeliveryStatus.IN_TRANSIT) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Cannot deliver before transit',
      );
    }

    return new Delivery({
      ...this,
      status: DeliveryStatus.DELIVERED,
      deliveredAt: now,
      updatedAt: now,
    });
  }

  /* 🔥 failure */

  markFailed(now = new Date()): Delivery {
    if (this.isFinal()) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Delivery already completed',
      );
    }

    return new Delivery({
      ...this,
      status: DeliveryStatus.FAILED,
      failedAt: now,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.orderId) {
      throw new ValidationError(
        'DELIVERY_INVALID_ORDER',
        'Order is required',
      );
    }

    if (!this.partnerId) {
      throw new ValidationError(
        'DELIVERY_INVALID_PARTNER',
        'Partner is required',
      );
    }

    if (!this.assignedAt) {
      throw new ValidationError(
        'DELIVERY_INVALID_ASSIGNMENT',
        'Assignment time required',
      );
    }
  }
}
