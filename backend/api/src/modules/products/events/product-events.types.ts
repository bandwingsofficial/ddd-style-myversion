/* ================================================= */
/* LIFECYCLE                                         */
/* ================================================= */

export interface ProductLifecycleEvent {
  productId: string;
}

/* ================================================= */
/* DETAILS UPDATE                                    */
/* ================================================= */

export interface ProductUpdatedEvent {
  productId: string;
  name: string;
  slug: string;
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
