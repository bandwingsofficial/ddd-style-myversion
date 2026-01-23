import { IsOptional, IsString } from 'class-validator';

export class UpdateProductImagesDto {
  @IsOptional()
  @IsString()
  replaceImage?: string;
}
