// src/modules/products/domain/models/product.model.ts

import { ValidationError } from '../../../../common/errors';

import { ProductStatus } from '../enums/product-status.enum';
import { ProductTag } from '../enums/product-tag.enum'; // ✅ MISSING IMPORT (CRITICAL)
import { UnitType } from '../enums/unit-type.enum';


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

  categoryId: string;
  stockItemId: string;

  name: ProductName;
  slug: ProductSlug;
  price: ProductPrice;
  images: ProductImages;

  tags: ProductTag[];

  unitValue: number;
  unitType: UnitType;

  // ⭐ ADD THESE
  ratingAverage?: number;
  ratingCount: number;

  shortDescription?: string;
  longDescription?: string;

  status: ProductStatus;
  trendState: ProductTrendState;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class Product {
  readonly id: string;

  readonly categoryId: string;
  readonly stockItemId: string;

  readonly name: ProductName;
  readonly slug: ProductSlug;
  readonly price: ProductPrice;
  readonly images: ProductImages;

  readonly tags: ProductTag[];

  readonly unitValue: number;
  readonly unitType: UnitType;

  // ⭐ ADD THESE
  readonly ratingAverage?: number;
  readonly ratingCount: number;

  readonly shortDescription?: string;
  readonly longDescription?: string;

  readonly status: ProductStatus;
  readonly trendState: ProductTrendState;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;

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
    categoryId: string;
    stockItemId: string;

    productName: string;
    originalPrice: number;
    discountPrice?: number;

    mainImage: string;
    galleryImages?: string[];

    tags?: ProductTag[];

    unitValue: number;
    unitType: UnitType;

    ratingAverage?: number;
    ratingCount: number;

    shortDescription?: string;
    longDescription?: string;

    isTrending?: boolean;
    createdBy: string;
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
      categoryId: params.categoryId,
      stockItemId: params.stockItemId,

      name,
      slug,
      price,
      images,

      tags: params.tags ?? [],

      unitValue: params.unitValue,
      unitType: params.unitType,

      ratingAverage: params.ratingAverage,
      ratingCount: params.ratingCount,

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

    if (!this.categoryId) {
      throw new ValidationError(
        'PRODUCT_INVALID_CATEGORY',
        'Category is required for product',
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
