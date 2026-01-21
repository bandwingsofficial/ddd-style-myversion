import { Product } from '../domain/models/product.model';

export class PublicProductListDto {
  id: string;

   category: {
    id: string;
    name: string;
  };


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

  unit: {
    value: number;
    type: string;
  };

  tags: string[];

  rating: {
    average: number;
    count: number;
  };

  shortDescription: string | null;
  longDescription: string | null;

  trendState: {
    trending: boolean;
  };

  /* ================================================= */
  /* FACTORY                                          */
  /* ================================================= */

 static fromDomain(
  product: Product,
  category: { id: string; name: string },
): PublicProductListDto{
    return {
      id: product.id,

      category: {
    id: category.id,
    name: category.name,
  },

      name: {
        value: product.name.getValue(),
      },

      slug: {
        value: product.slug.getValue(),
      },

      price: {
        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount() ?? null,
      },

      images: {
        mainImage: product.images.getMain(),
        galleryImages: product.images.getGallery(),
      },

      unit: {
        value: product.unitValue,
        type: product.unitType,
      },

      tags: product.tags,

      rating: {
        average: product.ratingAverage ?? 0,
        count: product.ratingCount ?? 0,
      },

      shortDescription: product.shortDescription ?? null,
      longDescription: product.longDescription ?? null,

      trendState: {
        trending: product.trendState.getRaw(),
      },
    };
  }
}
