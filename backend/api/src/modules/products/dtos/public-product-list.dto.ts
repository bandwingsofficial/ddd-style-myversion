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

  featuredState: {
    featured: boolean;
  };

  ingredients: string | null;
  benefits: string | null;
  extraInfo1: string | null;
  extraInfo2: string | null;

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
      featuredState: {
        featured: product.featuredState.getRaw(),
      },

      ingredients: product.ingredients ?? null,
      benefits: product.benefits ?? null,
      extraInfo1: product.extraInfo1 ?? null,
      extraInfo2: product.extraInfo2 ?? null, 
    };
  }
}
  