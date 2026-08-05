import { ValidationError } from '../../../../common/errors';

export class OrderAddress {
  private readonly label: string;
  private readonly addressText: string;
  private readonly houseNumber?: string;
  private readonly street?: string;
  private readonly landmark?: string;
  private readonly pincode?: string;
  private readonly latitude?: number;
  private readonly longitude?: number;

  private constructor(
    label: string,
    addressText: string,
    houseNumber?: string,
    street?: string,
    landmark?: string,
    pincode?: string,
    latitude?: number,
    longitude?: number,
  ) {
    this.label = label;
    this.addressText = addressText;
    this.houseNumber = houseNumber;
    this.street = street;
    this.landmark = landmark;
    this.pincode = pincode;
    this.latitude = latitude;
    this.longitude = longitude;

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                        */
  /* ---------------------------------------------- */

  static create(params: {
    label: string;
    addressText: string;
    houseNumber?: string | null;
    street?: string | null;
    landmark?: string | null;
    pincode?: string | null;
    latitude?: number;
    longitude?: number;
  }): OrderAddress {
    if (!params.label?.trim()) {
      throw new ValidationError(
        'INVALID_ADDRESS_LABEL',
        'Address label is required',
      );
    }

    if (!params.addressText?.trim()) {
      throw new ValidationError(
        'INVALID_ADDRESS_TEXT',
        'Address text is required',
      );
    }

    return new OrderAddress(
      params.label.trim(),
      params.addressText.trim(),
      params.houseNumber?.trim() || undefined,
      params.street?.trim() || undefined,
      params.landmark?.trim() || undefined,
      params.pincode?.trim() || undefined,
      params.latitude,
      params.longitude,
    );
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getLabel(): string {
    return this.label;
  }

  getAddressText(): string {
    return this.addressText;
  }

  getHouseNumber(): string | undefined {
    return this.houseNumber;
  }

  getStreet(): string | undefined {
    return this.street;
  }

  getLandmark(): string | undefined {
    return this.landmark;
  }

  getPincode(): string | undefined {
    return this.pincode;
  }

  getLatitude(): number | undefined {
    return this.latitude;
  }

  getLongitude(): number | undefined {
    return this.longitude;
  }
}
