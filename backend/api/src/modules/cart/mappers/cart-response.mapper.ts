import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { UploadService } from '../../uploads/services/upload.service';
import { Cart } from '../domain/models/cart.model';
import { DeliveryChargeService } from '../../delivery-config/services/delivery-charge.service';
import { mapDeliveryChargeToResponse } from '../../delivery-config/mappers/delivery-charge-response.mapper';

const toNumber = (value: Prisma.Decimal | number): number => Number(value);

@Injectable()
export class CartResponseMapper {
  constructor(
    private readonly uploadService: UploadService,
    private readonly deliveryChargeService: DeliveryChargeService,
  ) {}

  async toResponse(cart: Cart | null) {
    if (!cart) {
      return null;
    }

    const items = await Promise.all(
      cart.items.map(async (item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        productName: item.productName,
        productImage: await this.resolveImageUrl(item.productImage),
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        discountPrice:
          item.discountPrice != null
            ? toNumber(item.discountPrice)
            : undefined,
        lineTotal: toNumber(item.getLineTotal()),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    );

    const subtotal = toNumber(cart.subtotal);
    const discount = toNumber(cart.discount);
    const netSubtotal = toNumber(cart.afterDiscountTotal);

    const pricing = mapDeliveryChargeToResponse(
      await this.deliveryChargeService.calculate({
        subtotal: cart.subtotal,
        discount: cart.discount,
        netSubtotal: cart.afterDiscountTotal,
        itemCount: cart.itemCount,
      }),
    );

    return {
      id: cart.id,
      customerId: cart.customerId,
      sessionId: cart.sessionId,
      outletId: cart.outletId,
      status: cart.status,
      currency: cart.currency,
      subtotal,
      discount,
      netSubtotal,
      afterDiscountTotal: netSubtotal,
      grandTotal: Number((netSubtotal + pricing.deliveryFee).toFixed(2)),
      itemCount: cart.itemCount,
      ...pricing,
      items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      lockedAt: cart.lockedAt,
      expiresAt: cart.expiresAt,
    };
  }

  private async resolveImageUrl(imageRef?: string | null): Promise<string> {
    if (!imageRef?.trim()) {
      return '';
    }

    if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
      return imageRef;
    }

    try {
      return await this.uploadService.generatePresignedGetUrl({
        objectKey: imageRef,
      });
    } catch {
      return imageRef;
    }
  }
}
