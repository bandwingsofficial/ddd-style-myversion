// src/modules/outlets/domain/value-objects/outlet-address.vo.ts

export interface OutletAddressProps {
  address?: string;
  location?: string;
  pincode?: string;
}

export class OutletAddress {
  readonly address?: string;
  readonly location?: string;
  readonly pincode?: string;

  private constructor(props: OutletAddressProps) {
    this.address = props.address;
    this.location = props.location;
    this.pincode = props.pincode;
    Object.freeze(this);
  }

  static create(props?: OutletAddressProps): OutletAddress {
    if (!props) {
      return new OutletAddress({});
    }

    return new OutletAddress({
      address: props.address?.trim() || undefined,
      location: props.location?.trim() || undefined,
      pincode: props.pincode?.trim() || undefined,
    });
  }

  equals(other?: OutletAddress): boolean {
    if (!other) return false;

    return (
      this.address === other.address &&
      this.location === other.location &&
      this.pincode === other.pincode
    );
  }

  /** Persistence only */
  getRaw(): OutletAddressProps {
    return {
      address: this.address,
      location: this.location,
      pincode: this.pincode,
    };
  }
}
