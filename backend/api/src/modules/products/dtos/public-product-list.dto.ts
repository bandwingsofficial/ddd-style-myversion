export class PublicProductListDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  isTrending: boolean;
  mainImage: string;

  static fromDomain(product: any): PublicProductListDto {
    return {
      id: product.id,
      name: product.name.getValue(),
      slug: product.slug.getValue(),
      price: product.price.getDiscount() ?? product.price.getOriginal(),
      originalPrice: product.price.getOriginal(),
      isTrending: product.trendState.getRaw(),
      mainImage: product.images.getMain(),
    };
  }
}
