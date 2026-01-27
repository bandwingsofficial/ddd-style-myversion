import { PaymentResponseDto } from './payment-response.dto';
import { Payment } from '../domain/models/payment.model';

export class CreatePaymentResponseDto {
  payment: PaymentResponseDto;
  checkoutUrl: string;

  static from(payment: Payment, checkoutUrl: string) {
    return {
      payment: PaymentResponseDto.fromDomain(payment),
      checkoutUrl,
    };
  }
}
