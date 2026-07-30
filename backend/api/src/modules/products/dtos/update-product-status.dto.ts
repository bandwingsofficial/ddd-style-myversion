import { IsEnum } from 'class-validator';

import { ProductStatus } from '../domain/enums/product-status.enum';

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
