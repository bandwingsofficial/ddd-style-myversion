import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryRuleDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumOrderAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee!: number;

  @IsOptional()
  @IsBoolean()
  isFreeDelivery?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  priority!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

export class UpdateDeliveryRuleDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumOrderAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee!: number;

  @IsOptional()
  @IsBoolean()
  isFreeDelivery?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  priority!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
