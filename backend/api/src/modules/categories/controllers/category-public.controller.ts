// src/modules/categories/controllers/category-public.controller.ts

import { Controller, Get } from '@nestjs/common';

import { CategoryOrchestratorService } from '../services/category-orchestrator.service';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('public/categories')
@Public() // 🔓 NO JWT, NO ROLES
export class CategoryPublicController {
  constructor(
    private readonly orchestrator: CategoryOrchestratorService,
  ) {}

  @Get()
  async getCategoriesForPublic() {
    const data =
      await this.orchestrator.getAllCategories({
        includeInactive: false,
      });

    return {
      success: true,
      code: 'CATEGORIES_FETCHED',
      message: 'Categories fetched successfully',
      data,
    };
  }
}
