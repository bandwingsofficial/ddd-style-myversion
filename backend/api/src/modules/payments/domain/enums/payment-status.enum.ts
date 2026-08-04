import { PaymentStatus as PrismaPaymentStatus } from '@prisma/client';

/**
 * Values persisted in Payment.status (keep in sync with prisma/schema.prisma).
 */
export const PRISMA_PAYMENT_STATUSES = [
  'INITIATED',
  'SUCCESS',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
] as const;

export type PrismaStoredPaymentStatus =
  (typeof PRISMA_PAYMENT_STATUSES)[number];

export function isPrismaStoredPaymentStatus(
  status: string,
): status is PrismaStoredPaymentStatus {
  return (PRISMA_PAYMENT_STATUSES as readonly string[]).includes(status);
}

/** Extended payment lifecycle statuses (API + admin display). */
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

/**
 * Prisma / DB row → domain. Never throws for known or future Prisma enum strings.
 */
export function mapPrismaPaymentStatusToDomain(
  status: PrismaPaymentStatus | string,
): PaymentStatus {
  switch (status) {
    case PrismaPaymentStatus.INITIATED:
    case 'INITIATED':
      return PaymentStatus.INITIATED;
    case PrismaPaymentStatus.SUCCESS:
    case 'SUCCESS':
      return PaymentStatus.SUCCESS;
    case PrismaPaymentStatus.FAILED:
    case 'FAILED':
      return PaymentStatus.FAILED;
    case PrismaPaymentStatus.EXPIRED:
    case 'EXPIRED':
      return PaymentStatus.EXPIRED;
    case PrismaPaymentStatus.REFUNDED:
    case 'REFUNDED':
      return PaymentStatus.REFUNDED;
    default:
      return status as PaymentStatus;
  }
}

/**
 * Domain → Prisma for writes. Maps extended domain statuses to stored values.
 */
export function mapDomainPaymentStatusToPrisma(
  status: PaymentStatus,
): PrismaPaymentStatus {
  switch (status) {
    case PaymentStatus.INITIATED:
    case PaymentStatus.CREATED:
    case PaymentStatus.PENDING:
    case PaymentStatus.PROCESSING:
    case PaymentStatus.VERIFICATION_PENDING:
      return PrismaPaymentStatus.INITIATED;

    case PaymentStatus.SUCCESS:
    case PaymentStatus.AUTHORIZED:
    case PaymentStatus.CAPTURED:
      return PrismaPaymentStatus.SUCCESS;

    case PaymentStatus.FAILED:
    case PaymentStatus.CANCELLED:
      return PrismaPaymentStatus.FAILED;

    case PaymentStatus.EXPIRED:
      return PrismaPaymentStatus.EXPIRED;

    case PaymentStatus.REFUNDED:
    case PaymentStatus.PARTIALLY_REFUNDED:
      return PrismaPaymentStatus.REFUNDED;

    default:
      if (isPrismaStoredPaymentStatus(status)) {
        return status as PrismaPaymentStatus;
      }
      return PrismaPaymentStatus.INITIATED;
  }
}

/** Alias for admin/list serializers reading raw DB strings. */
export function mapStoredPaymentStatus(status: string): PaymentStatus {
  return mapPrismaPaymentStatusToDomain(status);
}

export type OutletPaymentDisplayStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Resolve outlet-facing payment status from order + latest payment row.
 */
export function resolveOutletPaymentDisplayStatus(params: {
  orderStatus: string;
  paymentStatus?: PaymentStatus | null;
}): OutletPaymentDisplayStatus {
  const paymentStatus = params.paymentStatus;

  if (paymentStatus === PaymentStatus.SUCCESS) {
    return 'PAID';
  }

  if (paymentStatus === PaymentStatus.FAILED) {
    return 'FAILED';
  }

  if (paymentStatus === PaymentStatus.EXPIRED) {
    return params.orderStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
  }

  if (paymentStatus === PaymentStatus.REFUNDED) {
    return 'CANCELLED';
  }

  if (
    paymentStatus === PaymentStatus.INITIATED ||
    paymentStatus === PaymentStatus.CREATED ||
    paymentStatus === PaymentStatus.PENDING
  ) {
    return 'PENDING';
  }

  switch (params.orderStatus) {
    case 'PAYMENT_PENDING':
    case 'CREATED':
      return 'PENDING';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'FAILED':
      return 'FAILED';
    default:
      return 'PAID';
  }
}
