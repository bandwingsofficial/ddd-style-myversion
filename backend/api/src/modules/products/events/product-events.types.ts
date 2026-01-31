/* ================================================= */
/* LIFECYCLE                                         */
/* ================================================= */

export interface ProductLifecycleEvent {
  productId: string;
}

/* ================================================= */
/* DETAILS UPDATE                                    */
/* ================================================= */

/**
 * 🔁 Fired when core product details change
 * (name / slug / descriptions / category)
 */
export interface ProductUpdatedEvent {
  productId: string;

  name?: string;
  slug?: string;
  categoryId?: string;
}

/* ================================================= */
/* PRICE                                             */
/* ================================================= */

export interface ProductPriceChangedEvent {
  productId: string;

  originalPrice: number;
  discountPrice: number | null;
}

/* ================================================= */
/* IMAGES                                            */
/* ================================================= */

/**
 * 🖼 Fired when images are added or replaced
 */
export interface ProductImagesChangedEvent {
  productId: string;

  mainImage: string;
  galleryImages: string[];
}

/* ================================================= */
/* TRENDING                                          */
/* ================================================= */

export interface ProductTrendingChangedEvent {
  productId: string;

  isTrending: boolean;
}

/* ================================================= */
/* FEATURED                                          */
/* ================================================= */

export interface ProductFeaturedChangedEvent {
  productId: string;

  isFeatured: boolean;
}

/* ================================================= */
/* INGREDIENTS                                      */
/* ================================================= */

export interface ProductContentUpdatedEvent {
  productId: string;

  ingredients: string | null;
  benefits: string | null;
  extraInfo1: string | null;
  extraInfo2: string | null;
}