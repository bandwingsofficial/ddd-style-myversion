import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceProductGalleryImageDto {
  @IsString()
  @IsNotEmpty()
  galleryImageId: string;
}
