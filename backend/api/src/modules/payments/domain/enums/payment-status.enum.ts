// Extended payment lifecycle statuses (API + admin display).
// Prisma stores INITIATED/SUCCESS/FAILED/REFUNDED; map at boundaries.

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  /** @deprecated Use CREATED — kept for Prisma INITIATED rows */
  INITIATED = 'INITIATED',
}

export function mapStoredPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case 'INITIATED':
      return PaymentStatus.CREATED;
    case 'SUCCESS':
      return PaymentStatus.SUCCESS;
    case 'FAILED':
      return PaymentStatus.FAILED;
    case 'REFUNDED':
      return PaymentStatus.REFUNDED;
    default:
      return status as PaymentStatus;
  }
}
