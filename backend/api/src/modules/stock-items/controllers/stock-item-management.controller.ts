// src/modules/stock-items/controllers/stock-item-management.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StockItemOrchestratorService } from '../services/stock-item-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateStockItemDto } from '../dtos/create-stock-item.dto';
import { RenameStockItemDto } from '../dtos/rename-stock-item.dto';
import { ChangeStockItemUnitDto } from '../dtos/change-stock-item-unit.dto';

/* Domain */
import { StockItem } from '../domain/models/stock-item.model';
import { Unit } from '../domain/enums/unit.enum';
import { randomUUID } from 'crypto';

@Controller('stock-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN) // 🔐 ALL routes are admin-only
export class StockItemManagementController {
  constructor(
    private readonly orchestrator: StockItemOrchestratorService,
  ) {}

  /* ================================================= */
  /* STOCK ITEM – READS (ADMIN)                        */
  /* ================================================= */

  /**
   * ✅ GET ALL (ADMIN ONLY)
   */
  @Get()
  async getAllStockItems() {
    const data =
      await this.orchestrator.getAllStockItems();

    return {
      success: true,
      code: 'STOCK_ITEMS_FETCHED',
      message: 'Stock items fetched successfully',
      data,
    };
  }

  @Get(':stockItemId')
  async getStockItemById(
    @Param('stockItemId') stockItemId: string,
  ) {
    const data =
      await this.orchestrator.getStockItemById(
        stockItemId,
      );

    return {
      success: true,
      code: 'STOCK_ITEM_FETCHED',
      message: 'Stock item fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* STOCK ITEM – CREATE                               */
  /* ================================================= */

  @Post()
  async createStockItem(
    @Body() dto: CreateStockItemDto,
    @CurrentUser() user,
  ) {
    const stockItem = StockItem.createNew({
      id: randomUUID(),
      name: dto.name,
      unit: dto.unit as Unit,
    });

    const data =
      await this.orchestrator.createStockItem({
        stockItem,
      });

    return {
      success: true,
      code: 'STOCK_ITEM_CREATED',
      message: 'Stock item created successfully',
      data,
    };
  }

  /* ================================================= */
  /* STOCK ITEM – RENAME                               */
  /* ================================================= */

  @Post(':stockItemId/rename')
  async renameStockItem(
    @Param('stockItemId') stockItemId: string,
    @Body() dto: RenameStockItemDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.renameStockItem({
        stockItemId,
        name: dto.name,
      });

    return {
      success: true,
      code: 'STOCK_ITEM_UPDATED',
      message: 'Stock item renamed successfully',
      data,
    };
  }

  /* ================================================= */
  /* STOCK ITEM – ENABLE / DISABLE                     */
  /* ================================================= */

  @Post(':stockItemId/disable')
  async disableStockItem(
    @Param('stockItemId') stockItemId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.disableStockItem({
        stockItemId,
      });

    return {
      success: true,
      code: 'STOCK_ITEM_DISABLED',
      message: 'Stock item disabled successfully',
      data,
    };
  }

  @Post(':stockItemId/enable')
  async enableStockItem(
    @Param('stockItemId') stockItemId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.enableStockItem({
        stockItemId,
      });

    return {
      success: true,
      code: 'STOCK_ITEM_ENABLED',
      message: 'Stock item enabled successfully',
      data,
    };
  }

  /* ================================================= */
  /* STOCK ITEM – UNIT                                 */
  /* ================================================= */

  @Post(':stockItemId/unit')
  async changeUnit(
    @Param('stockItemId') stockItemId: string,
    @Body() dto: ChangeStockItemUnitDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.changeStockItemUnit({
        stockItemId,
        unit: dto.unit as Unit,
      });

    return {
      success: true,
      code: 'STOCK_ITEM_UNIT_CHANGED',
      message: 'Stock item unit updated successfully',
      data,
    };
  }
}
