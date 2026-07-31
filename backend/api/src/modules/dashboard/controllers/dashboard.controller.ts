import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { DashboardFilterQueryDto } from '../dtos/dashboard-filter-query.dto';
import { DashboardQueries } from '../queries/dashboard.queries';
import { DashboardOrchestratorService } from '../services/dashboard-orchestrator.service';
import { DashboardResponseMapper } from '../mappers/dashboard-response.mapper';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class DashboardController {
  constructor(
    private readonly orchestrator: DashboardOrchestratorService,
    private readonly queries: DashboardQueries,
    private readonly mapper: DashboardResponseMapper,
  ) {}

  @Get('summary')
  async getSummary(
    @Query() query: DashboardFilterQueryDto,
    @CurrentUser() user: { actorId: string; sessionId?: string },
  ) {
    const filter = this.queries.toFilter(query);
    const data = await this.orchestrator.getSummary(
      filter,
      user.actorId,
      user.sessionId,
    );
    return this.mapper.wrap(data, 'Dashboard summary fetched successfully');
  }

  @Get('revenue')
  async getRevenue(@Query() query: DashboardFilterQueryDto) {
    const data = await this.orchestrator.getRevenue(this.queries.toFilter(query));
    return this.mapper.wrap(data, 'Revenue analytics fetched successfully');
  }

  @Get('orders')
  async getOrders(@Query() query: DashboardFilterQueryDto) {
    const data = await this.orchestrator.getOrders(this.queries.toFilter(query));
    return this.mapper.wrap(data, 'Order analytics fetched successfully');
  }

  @Get('payments')
  async getPayments(@Query() query: DashboardFilterQueryDto) {
    const data = await this.orchestrator.getPayments(this.queries.toFilter(query));
    return this.mapper.wrap(data, 'Payment analytics fetched successfully');
  }

  @Get('products')
  async getProducts(@Query() query: DashboardFilterQueryDto) {
    const filter = this.queries.toFilter(query);
    const limit = this.queries.resolveTopLimit(query, 10);
    const data = await this.orchestrator.getProducts(filter, limit);
    return this.mapper.wrap(data, 'Product analytics fetched successfully');
  }

  @Get('customers')
  async getCustomers(@Query() query: DashboardFilterQueryDto) {
    const data = await this.orchestrator.getCustomers(this.queries.toFilter(query));
    return this.mapper.wrap(data, 'Customer analytics fetched successfully');
  }

  @Get('outlets')
  async getOutlets(@Query() query: DashboardFilterQueryDto) {
    const filter = this.queries.toFilter(query);
    const limit = this.queries.resolveTopLimit(query, 10);
    const data = await this.orchestrator.getOutlets(filter, limit);
    return this.mapper.wrap(data, 'Outlet analytics fetched successfully');
  }

  @Get('categories')
  async getCategories(@Query() query: DashboardFilterQueryDto) {
    const filter = this.queries.toFilter(query);
    const limit = this.queries.resolveTopLimit(query, 10);
    const data = await this.orchestrator.getCategories(filter, limit);
    return this.mapper.wrap(data, 'Category analytics fetched successfully');
  }

  @Get('brands')
  async getBrands() {
    const data = await this.orchestrator.getBrands();
    return this.mapper.wrap(data, 'Brand analytics fetched successfully');
  }

  @Get('recent-orders')
  async getRecentOrders(@Query() query: DashboardFilterQueryDto) {
    const filter = this.queries.toFilter(query);
    const limit = this.queries.resolveTopLimit(query, 10);
    const data = await this.orchestrator.getRecentOrders(filter, limit);
    return this.mapper.wrap(data, 'Recent orders fetched successfully');
  }

  @Get('recent-payments')
  async getRecentPayments(@Query() query: DashboardFilterQueryDto) {
    const filter = this.queries.toFilter(query);
    const limit = this.queries.resolveTopLimit(query, 10);
    const data = await this.orchestrator.getRecentPayments(filter, limit);
    return this.mapper.wrap(data, 'Recent payments fetched successfully');
  }

  @Get('low-stock')
  async getLowStock(@Query() query: DashboardFilterQueryDto) {
    const limit = this.queries.resolveTopLimit(query, 20);
    const data = await this.orchestrator.getLowStock(limit);
    return this.mapper.wrap(data, 'Low stock items fetched successfully');
  }

  @Get('charts')
  async getCharts(@Query() query: DashboardFilterQueryDto) {
    const data = await this.orchestrator.getCharts(this.queries.toFilter(query));
    return this.mapper.wrap(data, 'Dashboard charts fetched successfully');
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @Query() query: DashboardFilterQueryDto,
    @Query('section') section = 'summary',
    @Res() res: Response,
  ) {
    const filter = this.queries.toFilter(query);
    const csv = await this.orchestrator.exportCsv(filter, section);
    const filename = `dashboard-${section}-${Date.now()}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
