import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UploadService } from '../../uploads/services/upload.service';
import { Cart } from '../domain/models/cart.model';
import { resolveEffectivePrice } from '../../../common/utils/product-pricing.util';

const toNumber = (value: Prisma.Decimal | number): number => Number(value);

@Injectable()
export class CartResponseMapper {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
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
        outletId: cart.outletId,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        discountPrice:
          item.discountPrice != null ? toNumber(item.discountPrice) : undefined,
        effectivePrice: toNumber(
          resolveEffectivePrice(item.unitPrice, item.discountPrice),
        ),
        lineTotal: toNumber(item.getLineTotal()),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    );

    const subtotal = toNumber(cart.subtotal);
    const discount = toNumber(cart.discount);
    const netSubtotal = toNumber(cart.afterDiscountTotal);
    const deliveryFee = toNumber(cart.deliveryFee);
    const grandTotal = toNumber(cart.grandTotal);

    const outlet = await this.prisma.outlet.findUnique({
      where: { id: cart.outletId },
      select: { name: true },
    });

    return {
      id: cart.id,
      customerId: cart.customerId,
      sessionId: cart.sessionId,
      outletId: cart.outletId,
      outletName: outlet?.name ?? null,
      status: cart.status,
      currency: cart.currency,
      subtotal,
      discount,
      netSubtotal,
      afterDiscountTotal: netSubtotal,
      deliveryFee,
      grandTotal,
      itemCount: cart.itemCount,
      deliveryRuleId: cart.deliveryRuleId ?? null,
      deliveryRuleName: cart.deliveryRuleName ?? null,
      matchedDeliveryRuleId: cart.deliveryRuleId ?? null,
      matchedDeliveryRuleName: cart.deliveryRuleName ?? null,
      minimumOrderAmount: cart.deliveryRuleMinimumOrderAmount
        ? toNumber(cart.deliveryRuleMinimumOrderAmount)
        : null,
      isFreeDelivery: cart.isFreeDelivery,
      freeDeliveryThreshold: null,
      remainingForFreeDelivery: cart.amountToFreeDelivery
        ? toNumber(cart.amountToFreeDelivery)
        : null,
      amountToFreeDelivery: cart.amountToFreeDelivery
        ? toNumber(cart.amountToFreeDelivery)
        : null,
      remainingAmountForFreeDelivery: cart.amountToFreeDelivery
        ? toNumber(cart.amountToFreeDelivery)
        : null,
      remainingAmountForNextRule: null,
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
