import { ValidationError } from '../../../../common/errors';
import { OutletStatus } from '../enums/outlet-status.enum';
import { OutletWorkingState } from '../value-objects/outlet-working-state.vo';
import { CameraState } from '../value-objects/camera-state.vo';
import { GeoLocation } from '../value-objects/geo-location.vo';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OutletProps {
  id: string;
  name: string;
  branch?: string;

  address?: string;
  pincode?: string;

  location?: GeoLocation;

  status: OutletStatus;
  workingState: OutletWorkingState;
  cameraState: CameraState;

  deliveryRadiusKm?: number;
  isCentral: boolean;

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class Outlet {
  readonly id: string;
  readonly name: string;
  readonly branch?: string;
  readonly location?: GeoLocation;

  readonly status: OutletStatus;
  readonly workingState: OutletWorkingState;
  readonly cameraState: CameraState;

  readonly deliveryRadiusKm?: number;
  readonly isCentral: boolean;

  readonly address?: string;
  readonly pincode?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy?: string;

  private constructor(props: OutletProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    name: string;
    createdBy: string;
    branch?: string;
    address?: string;
    pincode?: string;
    location?: GeoLocation;
    deliveryRadiusKm?: number;
    cameraEnabled?: boolean;
    isCentral?: boolean;
    now?: Date;
  }): Outlet {
    const now = params.now ?? new Date();

    return new Outlet({
      id: params.id,
      name: params.name,
      branch: params.branch,
      address: params.address,
      pincode: params.pincode,
      location: params.location,
      deliveryRadiusKm: params.deliveryRadiusKm,
      isCentral: params.isCentral ?? false,

      status: OutletStatus.ACTIVE,
      workingState: OutletWorkingState.close(),
      cameraState: params.cameraEnabled
        ? CameraState.enabledButOff()
        : CameraState.disabled(),

      createdAt: now,
      updatedAt: now,
      createdBy: params.createdBy,
    });
  }

  static rehydrate(props: OutletProps): Outlet {
    return new Outlet(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === OutletStatus.ACTIVE;
  }

  /**
   * Used internally for ordering capability
   */
  canAcceptOrders(): boolean {
    return (
      this.status === OutletStatus.ACTIVE &&
      this.workingState.canAcceptOrders()
    );
  }

  canStreamCamera(): boolean {
    return (
      this.status === OutletStatus.ACTIVE &&
      this.cameraState.canStream()
    );
  }

  /* ---------------------------------------------- */
  /* 🔥 NEW: PUBLIC VISIBILITY (CUSTOMER SIDE)       */
  /* ---------------------------------------------- */

  /**
   * Used by:
   * - public APIs
   * - customer storefront
   * - listing screens
   *
   * Only show outlet if customers can place orders
   */
  isPubliclyVisible(): boolean {
    return this.canAcceptOrders();
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                              */
  /* ---------------------------------------------- */

  openShop(now = new Date()): Outlet {
    return new Outlet({
      ...this,
      workingState: OutletWorkingState.open(),
      updatedAt: now,
    });
  }

  closeShop(now = new Date()): Outlet {
    return new Outlet({
      ...this,
      workingState: OutletWorkingState.close(),
      updatedAt: now,
    });
  }

  temporarilyCloseShop(now = new Date()): Outlet {
    return new Outlet({
      ...this,
      workingState: OutletWorkingState.temporarilyClosed(),
      updatedAt: now,
    });
  }

  turnCameraOn(streamUrl: string, now = new Date()): Outlet {
    return new Outlet({
      ...this,
      cameraState: CameraState.turnOn(streamUrl),
      updatedAt: now,
    });
  }

  turnCameraOff(now = new Date()): Outlet {
    return new Outlet({
      ...this,
      cameraState: CameraState.enabledButOff(),
      updatedAt: now,
    });
  }

  disable(now = new Date()): Outlet {
    if (this.status === OutletStatus.INACTIVE) {
      return this;
    }

    return new Outlet({
      ...this,
      status: OutletStatus.INACTIVE,
      workingState: OutletWorkingState.close(),
      cameraState: CameraState.enabledButOff(),
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* UPDATE DETAILS                                  */
  /* ---------------------------------------------- */

  updateDetails(params: {
    name?: string;
    branch?: string;
    address?: string;
    pincode?: string;
    location?: GeoLocation;
    deliveryRadiusKm?: number;
    now?: Date;
  }): Outlet {
    return new Outlet({
      ...this,
      name: params.name ?? this.name,
      branch: params.branch ?? this.branch,
      address: params.address ?? this.address,
      pincode: params.pincode ?? this.pincode,
      location: params.location ?? this.location,
      deliveryRadiusKm:
        params.deliveryRadiusKm ?? this.deliveryRadiusKm,
      updatedAt: params.now ?? new Date(),
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                      */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new ValidationError(
        'OUTLET_INVALID_NAME',
        'Outlet name must be at least 3 characters',
      );
    }

    if (
      this.deliveryRadiusKm !== undefined &&
      this.deliveryRadiusKm <= 0
    ) {
      throw new ValidationError(
        'OUTLET_INVALID_RADIUS',
        'Delivery radius must be greater than 0',
      );
    }
    if (this.address && this.address.trim().length < 3) {
      throw new ValidationError(
        'OUTLET_INVALID_ADDRESS',
        'Outlet address must be at least 3 characters',
      );
    }

    if (this.pincode && this.pincode.trim().length !== 6) {
      throw new ValidationError(
        'OUTLET_INVALID_PINCODE',
        'Outlet pincode must be 6 characters',
      );
    }
  }
}
