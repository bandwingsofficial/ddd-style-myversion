import { ValidationError } from '../../../../common/errors';

import { ProductStatus } from '../enums/product-status.enum';

import { ProductName } from '../value-objects/product-name.vo';
import { ProductSlug } from '../value-objects/product-slug.vo';
import { ProductPrice } from '../value-objects/product-price.vo';
import { ProductImages } from '../value-objects/product-images.vo';
import { ProductTrendState } from '../value-objects/product-trend-state.vo';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface ProductProps {
  id: string;

  stockItemId: string;

  name: ProductName;
  slug: ProductSlug;
  price: ProductPrice;
  images: ProductImages;

  shortDescription?: string;
  longDescription?: string;

  status: ProductStatus;
  trendState: ProductTrendState;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ✅ REQUIRED
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class Product {
  readonly id: string;

  readonly stockItemId: string;

  readonly name: ProductName;
  readonly slug: ProductSlug;
  readonly price: ProductPrice;
  readonly images: ProductImages;

  readonly shortDescription?: string;
  readonly longDescription?: string;

  readonly status: ProductStatus;
  readonly trendState: ProductTrendState;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string; // ✅ REQUIRED

  private constructor(props: ProductProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    stockItemId: string;

    productName: string;
    originalPrice: number;
    discountPrice?: number;

    mainImage: string;
    galleryImages?: string[];

    shortDescription?: string;
    longDescription?: string;

    isTrending?: boolean;

    createdBy: string; // ✅ REQUIRED
    now?: Date;
  }): Product {
    const now = params.now ?? new Date();

    const name = ProductName.create(params.productName);
    const slug = ProductSlug.fromProductName(name.getValue());
    const price = ProductPrice.create(
      params.originalPrice,
      params.discountPrice,
    );
    const images = ProductImages.create(
      params.mainImage,
      params.galleryImages ?? [],
    );

    return new Product({
      id: params.id,
      stockItemId: params.stockItemId,

      name,
      slug,
      price,
      images,

      shortDescription: params.shortDescription,
      longDescription: params.longDescription,

      status: ProductStatus.ACTIVE,
      trendState: ProductTrendState.from(params.isTrending),

      createdAt: now,
      updatedAt: now,
      createdBy: params.createdBy,
    });
  }

  static rehydrate(props: ProductProps): Product {
    return new Product(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === ProductStatus.ACTIVE;
  }

  canBeShown(): boolean {
    return this.isActive();
  }

  canBePurchased(): boolean {
    return this.isActive();
  }

  isTrending(): boolean {
    return this.trendState.isTrending();
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  updateDetails(params: {
    productName?: string;
    shortDescription?: string;
    longDescription?: string;
    now?: Date;
  }): Product {
    const name = params.productName
      ? ProductName.create(params.productName)
      : this.name;

    const slug = params.productName
      ? ProductSlug.fromProductName(name.getValue())
      : this.slug;

    return new Product({
      ...this,
      name,
      slug,
      shortDescription:
        params.shortDescription ?? this.shortDescription,
      longDescription:
        params.longDescription ?? this.longDescription,
      updatedAt: params.now ?? new Date(),
    });
  }

  updatePrice(params: {
    originalPrice: number;
    discountPrice?: number;
    now?: Date;
  }): Product {
    return new Product({
      ...this,
      price: ProductPrice.create(
        params.originalPrice,
        params.discountPrice,
      ),
      updatedAt: params.now ?? new Date(),
    });
  }

  updateImages(params: {
    mainImage: string;
    galleryImages?: string[];
    now?: Date;
  }): Product {
    return new Product({
      ...this,
      images: ProductImages.create(
        params.mainImage,
        params.galleryImages ?? [],
      ),
      updatedAt: params.now ?? new Date(),
    });
  }

  markTrending(now = new Date()): Product {
    return new Product({
      ...this,
      trendState: ProductTrendState.trending(),
      updatedAt: now,
    });
  }

  unmarkTrending(now = new Date()): Product {
    return new Product({
      ...this,
      trendState: ProductTrendState.normal(),
      updatedAt: now,
    });
  }

  disable(now = new Date()): Product {
    if (this.status === ProductStatus.INACTIVE) {
      return this;
    }

    return new Product({
      ...this,
      status: ProductStatus.INACTIVE,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.stockItemId) {
      throw new ValidationError(
        'PRODUCT_INVALID_STOCK_ITEM',
        'Stock item is required for product',
      );
    }

    if (
      this.shortDescription &&
      this.shortDescription.length > 300
    ) {
      throw new ValidationError(
        'PRODUCT_SHORT_DESC_TOO_LONG',
        'Short description must not exceed 300 characters',
      );
    }
  }
}
