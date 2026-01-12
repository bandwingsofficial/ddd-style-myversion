import { ProductStatus } from '../enums/product-status.enum';

export class ProductStatusState {
  private readonly status: ProductStatus;

  private constructor(status: ProductStatus) {
    this.status = status;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static active(): ProductStatusState {
    return new ProductStatusState(ProductStatus.ACTIVE);
  }

  static inactive(): ProductStatusState {
    return new ProductStatusState(ProductStatus.INACTIVE);
  }

  static from(status?: ProductStatus): ProductStatusState {
    if (!status) {
      return ProductStatusState.active();
    }

    return new ProductStatusState(status);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === ProductStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === ProductStatus.INACTIVE;
  }

  canBeShown(): boolean {
    return this.isActive();
  }

  canBePurchased(): boolean {
    return this.isActive();
  }

  /* ---------------------------------------------- */
  /* COMPARISON                                     */
  /* ---------------------------------------------- */

  equals(other?: ProductStatusState): boolean {
    if (!other) return false;
    return this.status === other.status;
  }

  /* ---------------------------------------------- */
  /* PERSISTENCE ONLY                               */
  /* ---------------------------------------------- */

  getRaw(): ProductStatus {
    return this.status;
  }
}
