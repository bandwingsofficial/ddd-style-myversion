// src/modules/categories/dtos/update-category-details.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDetailsDto {
  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  removeImage?: string; // "true" | "false"
}
