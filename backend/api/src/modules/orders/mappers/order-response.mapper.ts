import { Injectable } from '@nestjs/common';

import { UploadService } from '../../uploads/services/upload.service';
import { Order } from '../domain/models/order.model';

@Injectable()
export class OrderResponseMapper {
  constructor(private readonly uploadService: UploadService) {}

  async toCustomerOrderResponse(order: Order) {
    const items = await Promise.all(
      order.items.map(async (item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: await this.resolveImageUrl(item.productImage),
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        discountPrice: item.discountPrice?.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
        createdAt: item.createdAt,
      })),
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerFullName: order.customerFullName,
      outletId: order.outletId,
      cartId: order.cartId,
      address: {
        label: order.address.getLabel(),
        addressText: order.address.getAddressText(),
        latitude: order.address.getLatitude(),
        longitude: order.address.getLongitude(),
      },
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      netSubtotal: order.afterDiscountTotal.toNumber(),
      afterDiscountTotal: order.afterDiscountTotal.toNumber(),
      deliveryFee: order.deliveryFee.toNumber(),
      grandTotal: order.grandTotal.toNumber(),
      itemCount: order.itemCount,
      deliveryRuleId: order.deliveryRuleId ?? null,
      deliveryRuleName: order.deliveryRuleName ?? null,
      deliveryRuleMinimumOrderAmount:
        order.deliveryRuleMinimumOrderAmount?.toNumber() ?? null,
      isFreeDelivery: order.isFreeDelivery,
      status: order.status,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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
