import { ValidationError } from '../../../../common/errors';

export class ProductFeaturedState {
  private readonly featured: boolean;

  private constructor(featured: boolean) {
    this.featured = featured;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static featured(): ProductFeaturedState {
    return new ProductFeaturedState(true);
  }

  static normal(): ProductFeaturedState {
    return new ProductFeaturedState(false);
  }

  static from(value?: boolean): ProductFeaturedState {
    if (value === undefined || value === null) {
      return ProductFeaturedState.normal();
    }

    if (typeof value !== 'boolean') {
      throw new ValidationError(
        'INVALID_FEATURED_FLAG',
        'Featured flag must be a boolean',
      );
    }

    return new ProductFeaturedState(value);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isFeatured(): boolean {
    return this.featured === true;
  }

  /* ---------------------------------------------- */
  /* COMPARISON                                     */
  /* ---------------------------------------------- */

  equals(other?: ProductFeaturedState): boolean {
    if (!other) return false;
    return this.featured === other.featured;
  }

  /* ---------------------------------------------- */
  /* PERSISTENCE ONLY                               */
  /* ---------------------------------------------- */

  getRaw(): boolean {
    return this.featured;
  }
}
