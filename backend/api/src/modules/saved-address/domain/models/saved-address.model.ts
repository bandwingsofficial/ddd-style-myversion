import { ValidationError } from '../../../../common/errors';
import { SavedAddressType } from '../enums/saved-address-type.enum';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface SavedAddressProps {
  id: string;
  customerId: string;
  type: SavedAddressType;
  label: string;
  addressText: string;
  latitude?: number | null;
  longitude?: number | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class SavedAddress {
  readonly id: string;
  readonly customerId: string;
  readonly type: SavedAddressType;
  readonly label: string;
  readonly addressText: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly isDeleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: SavedAddressProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    customerId: string;
    type: SavedAddressType;
    label: string;
    addressText: string;
    latitude?: number;
    longitude?: number;
    now?: Date;
  }): SavedAddress {
    const now = params.now ?? new Date();

    return new SavedAddress({
      id: params.id,
      customerId: params.customerId,
      type: params.type,
      label: params.label,
      addressText: params.addressText,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: SavedAddressProps): SavedAddress {
    return new SavedAddress(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isHome(): boolean {
    return this.type === SavedAddressType.HOME;
  }

  isWork(): boolean {
    return this.type === SavedAddressType.WORK;
  }

  isOther(): boolean {
    return this.type === SavedAddressType.OTHER;
  }

  isActive(): boolean {
    return !this.isDeleted;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  updateDetails(
    params: {
      label?: string;
      addressText?: string;
      latitude?: number | null;
      longitude?: number | null;
    },
    now = new Date(),
  ): SavedAddress {
    return new SavedAddress({
      ...this,
      label: params.label ?? this.label,
      addressText: params.addressText ?? this.addressText,
      latitude:
        params.latitude !== undefined
          ? params.latitude
          : this.latitude,
      longitude:
        params.longitude !== undefined
          ? params.longitude
          : this.longitude,
      updatedAt: now,
    });
  }

  softDelete(now = new Date()): SavedAddress {
    if (this.isDeleted) {
      return this; // idempotent
    }

    return new SavedAddress({
      ...this,
      isDeleted: true,
      updatedAt: now,
    });
  }

  /** ✅ OPTION B SUPPORT */
  restore(now = new Date()): SavedAddress {
    if (!this.isDeleted) {
      return this; // idempotent
    }

    return new SavedAddress({
      ...this,
      isDeleted: false,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.customerId) {
      throw new ValidationError(
        'SAVED_ADDRESS_INVALID_CUSTOMER',
        'Customer is required for saved address',
      );
    }

    if (!this.label || this.label.trim().length < 2) {
      throw new ValidationError(
        'SAVED_ADDRESS_INVALID_LABEL',
        'Address label must be at least 2 characters',
      );
    }

    if (!this.addressText || this.addressText.trim().length < 5) {
      throw new ValidationError(
        'SAVED_ADDRESS_INVALID_ADDRESS',
        'Address text must be at least 5 characters',
      );
    }

    if (
      this.latitude !== null &&
      this.latitude !== undefined &&
      (this.latitude < -90 || this.latitude > 90)
    ) {
      throw new ValidationError(
        'SAVED_ADDRESS_INVALID_LATITUDE',
        'Latitude must be between -90 and 90',
      );
    }

    if (
      this.longitude !== null &&
      this.longitude !== undefined &&
      (this.longitude < -180 || this.longitude > 180)
    ) {
      throw new ValidationError(
        'SAVED_ADDRESS_INVALID_LONGITUDE',
        'Longitude must be between -180 and 180',
      );
    }
  }
}
