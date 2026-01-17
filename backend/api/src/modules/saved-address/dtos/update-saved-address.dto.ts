import { IsOptional, IsString, MaxLength, MinLength, IsNumber } from 'class-validator';

export class UpdateSavedAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  addressText?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;
}
