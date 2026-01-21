// src/modules/products/events/product-events.constants.ts

export const ProductEvents = {
  /* ================================================= */
  /* LIFECYCLE                                        */
  /* ================================================= */

  PRODUCT_CREATED: 'product.created',
  PRODUCT_ENABLED: 'product.enabled',
  PRODUCT_DISABLED: 'product.disabled',

  /* ================================================= */
  /* UPDATE                                           */
  /* ================================================= */

  PRODUCT_UPDATED: 'product.updated',

  PRODUCT_PRICE_CHANGED: 'product.price.changed',
  PRODUCT_TRENDING_CHANGED: 'product.trending.changed',

  /* ================================================= */
  /* MEDIA                                            */
  /* ================================================= */

  PRODUCT_IMAGES_UPDATED: 'product.images.updated',
  PRODUCT_IMAGES_REMOVED: 'product.images.removed',
} as const;
