import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductEvents } from '../events/product-events.constants';
import {
  ProductLifecycleEvent,
  ProductUpdatedEvent,
  ProductTrendingChangedEvent,
} from '../events/product-events.types';

import { ProductPublicGateway } from '../gateways/product-public.gateway';

@Injectable()
export class ProductPublicListener {
  constructor(
    private readonly gateway: ProductPublicGateway,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_CREATED)
  handleProductCreated(
    event: ProductLifecycleEvent,
  ): void {
    this.gateway.emitProductCreated({
      productId: event.productId,
    });
  }

  @OnEvent(ProductEvents.PRODUCT_ENABLED)
  handleProductEnabled(
    event: ProductLifecycleEvent,
  ): void {
    this.gateway.emitProductEnabled({
      productId: event.productId,
    });
  }

  @OnEvent(ProductEvents.PRODUCT_DISABLED)
  handleProductDisabled(
    event: ProductLifecycleEvent,
  ): void {
    this.gateway.emitProductDisabled({
      productId: event.productId,
    });
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_UPDATED)
  handleProductUpdated(
    event: ProductUpdatedEvent,
  ): void {
    this.gateway.emitProductUpdated({
      productId: event.productId,
      name: event.name,
      slug: event.slug,
    });
  }

  /* ================================================= */
  /* TRENDING                                          */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_TRENDING_CHANGED)
  handleProductTrendingChanged(
    event: ProductTrendingChangedEvent,
  ): void {
    this.gateway.emitProductTrendingChanged({
      productId: event.productId,
      isTrending: event.isTrending,
    });
  }
}
