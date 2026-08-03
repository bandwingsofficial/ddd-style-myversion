// src/modules/products/mappers/product-response.mapper.ts

import { Injectable } from '@nestjs/common';

import { UploadService } from '../../uploads/services/upload.service';
import { Product } from '../domain/models/product.model';

export interface ProductGalleryImageResponse {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ProductImagesResponse {
  mainImageUrl: string;
  galleryImages: ProductGalleryImageResponse[];
}

export interface ProductPublicImagesResponse {
  mainImageUrl: string;
  galleryImageUrls: string[];
}

export interface ProductResponse {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: { value: string };
  slug: { value: string };
  price: {
    originalPrice: number;
    discountPrice: number | null;
  };
  images: ProductImagesResponse;
  unitValue: number;
  unitType: string;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  shortDescription?: string;
  longDescription?: string;
  status: string;
  trendState: { trending: boolean };
  featuredState: { featured: boolean };
  ingredients?: string;
  benefits?: string;
  extraInfo1?: string;
  extraInfo2?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProductPublicResponse {
  id: string;
  category: {
    id: string;
    name: string;
  };
  name: { value: string };
  slug: { value: string };
  price: {
    originalPrice: number;
    discountPrice: number | null;
  };
  images: ProductPublicImagesResponse;
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
  trendState: { trending: boolean };
  featuredState: { featured: boolean };
  ingredients: string | null;
  benefits: string | null;
  extraInfo1: string | null;
  extraInfo2: string | null;
}

export interface ProductSlugPageResponse {
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  product: ProductPublicResponse | null;
  relatedProducts: ProductPublicResponse[];
  message?: string;
}

export type ProductGalleryRecord = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

@Injectable()
export class ProductResponseMapper {
  constructor(private readonly uploadService: UploadService) {}

  async toResponse(
    product: Product,
    galleryRecords: ProductGalleryRecord[],
  ): Promise<ProductResponse> {
    const sortedRecords = [...galleryRecords].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return {
      id: product.id,
      categoryId: product.categoryId,
      name: { value: product.name.getValue() },
      slug: { value: product.slug.getValue() },
      price: {
        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount() ?? null,
      },
      images: {
        mainImageUrl: await this.resolveImageUrl(
          product.images.getMain(),
        ),
        galleryImages: await Promise.all(
          sortedRecords.map(async (record) => ({
            id: record.id,
            imageUrl: await this.resolveImageUrl(record.imageUrl),
            sortOrder: record.sortOrder,
          })),
        ),
      },
      unitValue: product.unitValue,
      unitType: product.unitType,
      tags: product.tags,
      ratingAverage: product.ratingAverage ?? 0,
      ratingCount: product.ratingCount ?? 0,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      status: product.status,
      trendState: { trending: product.trendState.getRaw() },
      featuredState: { featured: product.featuredState.getRaw() },
      ingredients: product.ingredients,
      benefits: product.benefits,
      extraInfo1: product.extraInfo1,
      extraInfo2: product.extraInfo2,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdBy: product.createdBy,
    };
  }

  async toResponseList(
    products: Product[],
    galleryRecordsMap: Map<string, ProductGalleryRecord[]>,
  ): Promise<ProductResponse[]> {
    return Promise.all(
      products.map((product) =>
        this.toResponse(
          product,
          galleryRecordsMap.get(product.id) ?? [],
        ),
      ),
    );
  }

  async toPublicResponse(
    product: Product,
    category: { id: string; name: string },
    galleryRecords: ProductGalleryRecord[],
  ): Promise<ProductPublicResponse> {
    const sortedRecords = [...galleryRecords].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return {
      id: product.id,
      category,
      name: { value: product.name.getValue() },
      slug: { value: product.slug.getValue() },
      price: {
        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount() ?? null,
      },
      images: {
        mainImageUrl: await this.resolveImageUrl(
          product.images.getMain(),
        ),
        galleryImageUrls: await Promise.all(
          sortedRecords.map((record) =>
            this.resolveImageUrl(record.imageUrl),
          ),
        ),
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
      trendState: { trending: product.trendState.getRaw() },
      featuredState: { featured: product.featuredState.getRaw() },
      ingredients: product.ingredients ?? null,
      benefits: product.benefits ?? null,
      extraInfo1: product.extraInfo1 ?? null,
      extraInfo2: product.extraInfo2 ?? null,
    };
  }

  async toPublicResponseList(
    items: {
      product: Product;
      category: { id: string; name: string };
    }[],
    galleryRecordsMap: Map<string, ProductGalleryRecord[]>,
  ): Promise<ProductPublicResponse[]> {
    return Promise.all(
      items.map(({ product, category }) =>
        this.toPublicResponse(
          product,
          category,
          galleryRecordsMap.get(product.id) ?? [],
        ),
      ),
    );
  }

  private async resolveImageUrl(objectKey: string): Promise<string> {
    return this.uploadService.generatePresignedGetUrl({
      objectKey,
    });
  }
}
