import { Payment } from '../../payments/domain/models/payment.model';
import {
  OutletPaymentDisplayStatus,
  resolveOutletPaymentDisplayStatus,
} from '../../payments/domain/enums/payment-status.enum';
import { mapOrderCustomerDto } from '../../../common/utils/customer-display.util';

export type OutletPaymentStatus = OutletPaymentDisplayStatus;

export interface OutletOrderCustomerDto {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

export class OutletOrderResponseDto {
  id: string;
  orderNumber: string;
  customer: OutletOrderCustomerDto;
  /** Resolved display label — never "UNKNOWN". */
  customerFullName: string;
  grandTotal: number;
  itemCount: number;
  status: string;
  paymentStatus: OutletPaymentStatus;
  createdAt: Date;

  constructor(order: any, latestPayment?: Payment | null) {
    const customer = mapOrderCustomerDto({
      id: order.customerId,
      fullName: order.customerFullName,
      phone: order.customerPhone,
      email: order.customerEmail,
    });

    this.id = order.id;
    this.orderNumber = order.orderNumber;
    this.customer = {
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
    };
    this.customerFullName = customer.displayName;
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
    return resolveOutletPaymentDisplayStatus({
      orderStatus,
      paymentStatus: latestPayment?.status ?? null,
    });
  }
}
