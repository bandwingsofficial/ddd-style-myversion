import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { StockItemOrchestratorService } from '../services/stock-item-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { CreateStockItemDto } from '../dtos/create-stock-item.dto';
import { UpdateStockItemDto } from '../dtos/update-stock-item.dto';
import { UpdateStockItemStatusDto } from '../dtos/update-stock-item-status.dto';
import { ListStockItemsQueryDto } from '../dtos/list-stock-items-query.dto';

import { StockItem } from '../domain/models/stock-item.model';
import { Unit } from '../domain/enums/unit.enum';

@Controller('stock-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class StockItemManagementController {
  constructor(
    private readonly orchestrator: StockItemOrchestratorService,
  ) {}

  @Get()
  async listStockItems(@Query() query: ListStockItemsQueryDto) {
    const data = await this.orchestrator.listStockItems(query);

    return {
      success: true,
      message: 'Stock items fetched successfully',
      data,
    };
  }

  @Get(':stockItemId')
  async getStockItemById(@Param('stockItemId') stockItemId: string) {
    const data = await this.orchestrator.getStockItemById(stockItemId);

    return {
      success: true,
      message: 'Stock item fetched successfully',
      data,
    };
  }

  @Post()
  async createStockItem(@Body() dto: CreateStockItemDto) {
    const stockItem = StockItem.createNew({
      id: randomUUID(),
      name: dto.name,
      unit: dto.unit as Unit,
    });

    const data = await this.orchestrator.createStockItem({ stockItem });

    return {
      success: true,
      message: 'Stock item created successfully',
      data,
    };
  }

  @Patch(':stockItemId')
  async updateStockItem(
    @Param('stockItemId') stockItemId: string,
    @Body() dto: UpdateStockItemDto,
  ) {
    const data = await this.orchestrator.updateStockItem({
      stockItemId,
      name: dto.name,
      unit: dto.unit as Unit | undefined,
    });

    return {
      success: true,
      message: 'Stock item updated successfully',
      data,
    };
  }

  @Patch(':stockItemId/status')
  async updateStockItemStatus(
    @Param('stockItemId') stockItemId: string,
    @Body() dto: UpdateStockItemStatusDto,
  ) {
    const data = await this.orchestrator.updateStockItemStatus({
      stockItemId,
      status: dto.status,
    });

    return {
      success: true,
      message: 'Stock item status updated successfully',
      data,
    };
  }

  @Delete(':stockItemId')
  async deleteStockItem(
    @Param('stockItemId') stockItemId: string,
    @Query('force') force?: string,
  ) {
    const data = await this.orchestrator.deleteStockItem({
      stockItemId,
      force: force === 'true',
    });

    return {
      success: true,
      message: 'Stock item deleted permanently',
      data,
    };
  }
}
