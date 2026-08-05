import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

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
  @IsString()
  @MaxLength(100)
  houseNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  landmark?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pincode?: string | null;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;
}
