import {
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateProductPriceDto {
  @IsNumber()
  @Min(0.01)
  originalPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  discountPrice?: number;
}
