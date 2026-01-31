import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ProductEvents } from './product-events.constants';
import {
  ProductLifecycleEvent,
  ProductUpdatedEvent,
  ProductTrendingChangedEvent,
  ProductPriceChangedEvent,
  ProductImagesChangedEvent,
  ProductFeaturedChangedEvent,
  ProductContentUpdatedEvent,
} from './product-events.types';

@Injectable()
export class ProductEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                        */
  /* ================================================= */

  emitProductCreated(
    payload: ProductLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_CREATED,
      payload,
    );
  }

  emitProductEnabled(
    payload: ProductLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_ENABLED,
      payload,
    );
  }

  emitProductDisabled(
    payload: ProductLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_DISABLED,
      payload,
    );
  }

  /* ================================================= */
  /* UPDATE                                           */
  /* ================================================= */

  emitProductUpdated(
    payload: ProductUpdatedEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_UPDATED,
      payload,
    );
  }

  /* ================================================= */
  /* PRICE                                            */
  /* ================================================= */

  emitProductPriceChanged(
    payload: ProductPriceChangedEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_PRICE_CHANGED,
      payload,
    );
  }

  /* ================================================= */
  /* IMAGES                                           */
  /* ================================================= */

  emitProductImagesChanged(
    payload: ProductImagesChangedEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_IMAGES_UPDATED,
      payload,
    );
  }

  /* ================================================= */
  /* TRENDING                                         */
  /* ================================================= */

  emitProductTrendingChanged(
    payload: ProductTrendingChangedEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_TRENDING_CHANGED,
      payload,
    );
  }

  /* ================================================= */
  /* FEATURED                                         */
  /* ================================================= */

  emitProductFeaturedChanged(
    payload: ProductFeaturedChangedEvent,
  ): void {
    this.eventEmitter.emit(
      ProductEvents.PRODUCT_FEATURED_CHANGED,
      payload,
    );
  } 

  /* ================================================= */
  /* INGREDIENTS                                      */  
  /* ================================================= */
  
  emitProductContentUpdated(
  payload: ProductContentUpdatedEvent,
): void {
  this.eventEmitter.emit(
    ProductEvents.PRODUCT_CONTENT_UPDATED,
    payload,
  );
}
}
