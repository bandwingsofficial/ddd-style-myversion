import { Payment } from '../../payments/domain/models/payment.model';
import { PaymentStatus } from '../../payments/domain/enums/payment-status.enum';
import { OrderStatus } from '../../orders/domain/enums/order-status.enum';

export type OutletPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export class OutletOrderResponseDto {
  id: string;
  orderNumber: string;
  customerFullName: string | null;
  grandTotal: number;
  itemCount: number;
  status: string;
  paymentStatus: OutletPaymentStatus;
  createdAt: Date;

  constructor(order: any, latestPayment?: Payment | null) {
    this.id = order.id;
    this.orderNumber = order.orderNumber;
    this.customerFullName = order.customerFullName ?? null;
    this.grandTotal = order.grandTotal.toNumber();
    this.itemCount = order.itemCount;
    this.status = order.status;
    this.paymentStatus = OutletOrderResponseDto.resolvePaymentStatus(
      order.status,
      latestPayment,
    );
    this.createdAt = order.createdAt;
  }

  static resolvePaymentStatus(
    orderStatus: string,
    latestPayment?: Payment | null,
  ): OutletPaymentStatus {
    if (latestPayment?.status === PaymentStatus.SUCCESS) {
      return 'PAID';
    }

    if (latestPayment?.status === PaymentStatus.FAILED) {
      return 'FAILED';
    }

    switch (orderStatus) {
      case OrderStatus.PAYMENT_PENDING:
      case OrderStatus.CREATED:
        return 'PENDING';
      case OrderStatus.CANCELLED:
        return 'CANCELLED';
      case OrderStatus.FAILED:
        return 'FAILED';
      default:
        return 'PAID';
    }
  }
}
