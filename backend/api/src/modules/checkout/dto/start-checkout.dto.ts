import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class StartCheckoutDto {
  @IsUUID()
  savedAddressId: string;

  @IsUUID()
  outletId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  orderNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryInstructions?: string;
}
