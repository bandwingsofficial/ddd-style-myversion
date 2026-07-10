// src/modules/categories/mappers/category-response.mapper.ts

import { Injectable } from '@nestjs/common';

import { UploadService } from '../../uploads/services/upload.service';
import { Category } from '../domain/models/category.model';

export interface CategoryResponse {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  status: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryPublicResponse {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
}

@Injectable()
export class CategoryResponseMapper {
  constructor(private readonly uploadService: UploadService) {}

  async toResponse(category: Category): Promise<CategoryResponse> {
    return {
      id: category.id,
      name: category.name,
      subtitle: category.subtitle,
      imageUrl: await this.resolveImageUrl(category.imagePath),
      status: category.status,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async toResponseList(
    categories: Category[],
  ): Promise<CategoryResponse[]> {
    return Promise.all(
      categories.map((category) => this.toResponse(category)),
    );
  }

  async toPublicResponse(
    category: Category,
  ): Promise<CategoryPublicResponse> {
    return {
      id: category.id,
      name: category.name,
      subtitle: category.subtitle,
      imageUrl: await this.resolveImageUrl(category.imagePath),
    };
  }

  async toPublicResponseList(
    categories: Category[],
  ): Promise<CategoryPublicResponse[]> {
    return Promise.all(
      categories.map((category) => this.toPublicResponse(category)),
    );
  }

  private async resolveImageUrl(
    objectKey?: string,
  ): Promise<string | undefined> {
    if (!objectKey) {
      return undefined;
    }

    return this.uploadService.generatePresignedGetUrl({
      objectKey,
    });
  }
}
