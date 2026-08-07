import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitType } from '../domain/enums/unit-type.enum';
import { ProductTag } from '../domain/enums/product-tag.enum';

export class UpdateProductDetailsDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  productName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  unitValue?: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(ProductTag, { each: true })
  tags?: ProductTag[];

  @IsOptional()
  @IsBoolean()
  isTrending?: boolean;
}
