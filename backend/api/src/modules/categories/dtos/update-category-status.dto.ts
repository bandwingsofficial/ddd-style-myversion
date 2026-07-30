import { IsEnum, IsNotEmpty } from 'class-validator';

import { CategoryStatus } from '../domain/enums/category-status.enum';

export class UpdateCategoryStatusDto {
  @IsEnum(CategoryStatus)
  @IsNotEmpty()
  status: CategoryStatus;
}
