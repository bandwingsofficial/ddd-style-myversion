import { ValidationError } from '../../../../common/errors';

export class ProductTrendState {
  private readonly trending: boolean;

  private constructor(trending: boolean) {
    this.trending = trending;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static trending(): ProductTrendState {
    return new ProductTrendState(true);
  }

  static normal(): ProductTrendState {
    return new ProductTrendState(false);
  }

  static from(value?: boolean): ProductTrendState {
    if (value === undefined || value === null) {
      return ProductTrendState.normal();
    }

    if (typeof value !== 'boolean') {
      throw new ValidationError(
        'INVALID_TRENDING_FLAG',
        'Trending flag must be a boolean',
      );
    }

    return new ProductTrendState(value);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isTrending(): boolean {
    return this.trending === true;
  }

  /* ---------------------------------------------- */
  /* COMPARISON                                     */
  /* ---------------------------------------------- */

  equals(other?: ProductTrendState): boolean {
    if (!other) return false;
    return this.trending === other.trending;
  }

  /* ---------------------------------------------- */
  /* PERSISTENCE ONLY                               */
  /* ---------------------------------------------- */

  getRaw(): boolean {
    return this.trending;
  }
}
