import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';

import { DashboardPeriod } from '../domain/enums/dashboard-period.enum';

const CALENDAR_DATE_MESSAGE =
  'must be a valid calendar date in YYYY-MM-DD format';

function emptyToUndefined(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
}

export class DashboardFilterQueryDto {
  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: `startDate ${CALENDAR_DATE_MESSAGE}`,
  })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: `endDate ${CALENDAR_DATE_MESSAGE}`,
  })
  endDate?: string;

  @IsOptional()
  @IsUUID()
  outletId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(PaymentStatus, {
    message:
      'paymentStatus must be one of INITIATED, SUCCESS, FAILED, EXPIRED, REFUNDED',
  })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(OrderStatus, {
    message:
      'orderStatus must be one of CREATED, PAYMENT_PENDING, PAID, CONFIRMED, PREPARING, READY_TO_DISPATCH, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, FAILED',
  })
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsString()
  topLimit?: string;
}
