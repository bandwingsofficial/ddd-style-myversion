import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateProductImagesDto {
  @IsOptional()               // ✅ allow partial update
  @IsString()
  @IsNotEmpty()
  mainImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  galleryImages?: string[];
}
