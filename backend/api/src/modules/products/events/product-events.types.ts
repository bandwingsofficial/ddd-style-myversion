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
