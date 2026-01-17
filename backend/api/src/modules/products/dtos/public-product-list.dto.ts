export class PublicProductListDto {
  id: string;

  name: {
    value: string;
  };

  slug: {
    value: string;
  };

  price: {
    originalPrice: number;
    discountPrice: number | null;
  };

  images: {
    mainImage: string;
    galleryImages: string[];
  };

  shortDescription: string | null;
  longDescription: string | null;

  trendState: {
    trending: boolean;
  };

  /* ================================================= */
  /* FACTORY                                           */
  /* ================================================= */

  static fromDomain(product: any): PublicProductListDto {
    return {
      id: product.id,

      name: {
        value: product.name.getValue(),
      },

      slug: {
        value: product.slug.getValue(),
      },

      price: {
        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount(),
      },

      images: {
        mainImage: product.images.getMain(),
        galleryImages: product.images.getGallery(),
      },

      shortDescription:
        product.shortDescription?.getValue?.() ??
        product.shortDescription ??
        null,

      longDescription:
        product.longDescription?.getValue?.() ??
        product.longDescription ??
        null,

      trendState: {
        trending: product.trendState.getRaw(),
      },
    };
  }
}
