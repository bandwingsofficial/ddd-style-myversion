import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class StartCheckoutDto {
  @IsUUID()
  savedAddressId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}
