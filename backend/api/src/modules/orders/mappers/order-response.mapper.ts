import { Injectable } from '@nestjs/common';

import { UploadService } from '../../uploads/services/upload.service';
import { OutletOrderResponseDto } from '../../outlets/dtos/outlet-order-response.dto';
import { PaymentMapper } from '../../payments/mappers/payment.mapper';
import { Order } from '../domain/models/order.model';
import { OrderStatus } from '../domain/enums/order-status.enum';
import { mapOrderCustomerDto } from '../../../common/utils/customer-display.util';

type AdminOrderDetailRow = NonNullable<
  Awaited<
    ReturnType<
      import('../repositories/order.repository').OrderRepository['findAdminDetailRow']
    >
  >
>;

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

    const customer = mapOrderCustomerDto({
      id: order.customerId,
      fullName: order.customerFullName,
      phone: order.customerPhone,
      email: order.customerEmail,
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
      customerFullName: customer.displayName,
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

  async toAdminDetailResponse(row: AdminOrderDetailRow) {
    const latestPaymentRow = row.payments[0] ?? null;
    const latestPayment = latestPaymentRow
      ? PaymentMapper.toDomain(latestPaymentRow)
      : null;

    const items = await Promise.all(
      row.items.map(async (item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: await this.resolveImageUrl(item.productImage),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountPrice:
          item.discountPrice != null ? Number(item.discountPrice) : null,
        lineTotal: Number(item.totalPrice),
        createdAt: item.createdAt,
      })),
    );

    const cancellationEvent = [...row.events]
      .reverse()
      .find((event) => event.type === 'CANCELLED');

    const timeline = row.events.map((event) => ({
      type: event.type,
      label: event.type.replace(/_/g, ' '),
      at: event.createdAt,
      note: event.note,
    }));

    const customer = mapOrderCustomerDto({
      id: row.customer.id,
      fullName: row.customer.profile?.fullName,
      phone: row.customer.phone,
      email: row.customer.profile?.email,
    });

    return {
      id: row.id,
      orderNumber: row.orderNumber,
      status: row.status,
      paymentStatus: OutletOrderResponseDto.resolvePaymentStatus(
        row.status,
        latestPayment,
      ),
      outlet: {
        id: row.outlet.id,
        name: row.outlet.name,
      },
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        displayName: customer.displayName,
      },
      address: {
        label: row.addressLabel,
        addressText: row.addressText,
        latitude: row.latitude,
        longitude: row.longitude,
      },
      items,
      pricing: {
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        netSubtotal: Number(row.afterDiscountTotal),
        deliveryFee: Number(row.deliveryFee),
        grandTotal: Number(row.grandTotal),
      },
      payment: latestPaymentRow
        ? {
            id: latestPaymentRow.id,
            gateway: latestPaymentRow.provider,
            transactionId: latestPaymentRow.transactionId,
            method: latestPaymentRow.method,
            status: latestPaymentRow.status,
            paidAt: latestPaymentRow.paidAt,
            amount: Number(latestPaymentRow.amount),
          }
        : null,
      cancellationReason: cancellationEvent?.note ?? null,
      timeline,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
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
