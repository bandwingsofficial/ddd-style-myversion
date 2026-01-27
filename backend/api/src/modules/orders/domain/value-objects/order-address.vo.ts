import { ValidationError } from '../../../../common/errors';

export class OrderAddress {
  private readonly label: string;
  private readonly addressText: string;
  private readonly latitude?: number;
  private readonly longitude?: number;

  private constructor(
    label: string,
    addressText: string,
    latitude?: number,
    longitude?: number,
  ) {
    this.label = label;
    this.addressText = addressText;
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

  getLatitude(): number | undefined {
    return this.latitude;
  }

  getLongitude(): number | undefined {
    return this.longitude;
  }
}
