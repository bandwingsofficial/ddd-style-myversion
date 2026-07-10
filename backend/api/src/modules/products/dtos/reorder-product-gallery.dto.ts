import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderProductGalleryDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  galleryImageIds: string[];
}
