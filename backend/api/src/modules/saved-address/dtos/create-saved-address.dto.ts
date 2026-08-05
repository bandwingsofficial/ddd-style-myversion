import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';
import { SavedAddressType } from '../domain/enums/saved-address-type.enum';

export class CreateSavedAddressDto {
  @IsEnum(SavedAddressType)
  type: SavedAddressType;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  addressText: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  houseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  landmark?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pincode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
