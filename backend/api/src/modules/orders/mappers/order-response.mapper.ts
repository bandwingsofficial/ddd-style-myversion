import { Injectable } from '@nestjs/common';

import { UploadService } from '../../uploads/services/upload.service';
import { Order } from '../domain/models/order.model';
import { OrderStatus } from '../domain/enums/order-status.enum';

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
      paymentStatus: this.derivePaymentStatus(order.status),
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private derivePaymentStatus(
    status: OrderStatus,
  ): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' {
    switch (status) {
      case OrderStatus.PAYMENT_PENDING:
      case OrderStatus.CREATED:
        return 'PENDING';
      case OrderStatus.FAILED:
        return 'FAILED';
      case OrderStatus.CANCELLED:
        return 'CANCELLED';
      default:
        return 'PAID';
    }
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
