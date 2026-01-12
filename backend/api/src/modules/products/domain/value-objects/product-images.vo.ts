import { ValidationError } from '../../../../common/errors';

export class ProductImages {
  private readonly mainImage: string;
  private readonly galleryImages: string[];

  private static readonly MAX_GALLERY_IMAGES = 6;

  private constructor(mainImage: string, galleryImages: string[]) {
    this.mainImage = mainImage;
    this.galleryImages = galleryImages;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                        */
  /* ---------------------------------------------- */

  static create(
    mainImage: string,
    galleryImages: string[] = [],
  ): ProductImages {
    if (!mainImage) {
      throw new ValidationError(
        'INVALID_MAIN_IMAGE',
        'Main image is required',
      );
    }

    if (galleryImages.length > this.MAX_GALLERY_IMAGES) {
      throw new ValidationError(
        'TOO_MANY_GALLERY_IMAGES',
        `Maximum ${this.MAX_GALLERY_IMAGES} gallery images allowed`,
      );
    }

    return new ProductImages(mainImage, galleryImages);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getMain(): string {
    return this.mainImage;
  }

  getGallery(): string[] {
    return this.galleryImages;
  }
}
