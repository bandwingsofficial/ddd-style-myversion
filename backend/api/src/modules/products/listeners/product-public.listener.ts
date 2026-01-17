import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductEvents } from '../events/product-events.constants';
import { ProductRepository } from '../repositories/product.repository';
import { ProductPublicGateway } from '../gateways/product-public.gateway';
import { PublicProductListDto } from '../dtos/public-product-list.dto';

@Injectable()
export class ProductPublicListener {
  constructor(
    private readonly gateway: ProductPublicGateway,
    private readonly productRepo: ProductRepository,
  ) {}

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH (PUBLIC STATE)              */
  /* ================================================= */

  private async emitFullProductList(): Promise<void> {
    const products =
      await this.productRepo.findAll(); // ACTIVE only

    const payload = products.map((product) =>
      PublicProductListDto.fromDomain(product),
    );

    this.gateway.emitProductsUpdated({
      products: payload,
    });
  }

  /* ================================================= */
  /* LIFECYCLE EVENTS                                  */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_CREATED)
  async handleProductCreated(): Promise<void> {
    await this.emitFullProductList();
  }

  @OnEvent(ProductEvents.PRODUCT_ENABLED)
  async handleProductEnabled(): Promise<void> {
    await this.emitFullProductList();
  }

  @OnEvent(ProductEvents.PRODUCT_DISABLED)
  async handleProductDisabled(): Promise<void> {
    await this.emitFullProductList();
  }

  /* ================================================= */
  /* UPDATE EVENTS                                     */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_UPDATED)
  async handleProductUpdated(): Promise<void> {
    await this.emitFullProductList();
  }

  @OnEvent(ProductEvents.PRODUCT_PRICE_CHANGED)
  async handleProductPriceChanged(): Promise<void> {
    await this.emitFullProductList();
  }

  @OnEvent(ProductEvents.PRODUCT_IMAGES_CHANGED)
  async handleProductImagesChanged(): Promise<void> {
    await this.emitFullProductList();
  }

  /* ================================================= */
  /* TRENDING                                          */
  /* ================================================= */

  @OnEvent(ProductEvents.PRODUCT_TRENDING_CHANGED)
  async handleProductTrendingChanged(): Promise<void> {
    await this.emitFullProductList();
  }
}
