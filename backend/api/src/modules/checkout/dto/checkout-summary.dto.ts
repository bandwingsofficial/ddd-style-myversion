import { IsUUID } from 'class-validator';

export class CheckoutSummaryParamsDto {
  @IsUUID()
  savedAddressId: string;
}
