import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { RedisModule } from '../../../infrastructure/redis/redis.module';
import { UploadsModule } from '../../uploads/uploads.module';
import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';

import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardQueries } from '../queries/dashboard.queries';
import { DashboardResponseMapper } from '../mappers/dashboard-response.mapper';
import { DashboardCacheService } from '../services/dashboard-cache.service';
import { DashboardStatisticsService } from '../services/dashboard-statistics.service';
import { DashboardAnalyticsService } from '../services/dashboard-analytics.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardOrchestratorService } from '../services/dashboard-orchestrator.service';

@Module({
  imports: [RedisModule, UploadsModule],
  controllers: [DashboardController],
  providers: [
    PrismaService,
    AuditLogRepository,
    DashboardRepository,
    DashboardQueries,
    DashboardResponseMapper,
    DashboardCacheService,
    DashboardStatisticsService,
    DashboardAnalyticsService,
    DashboardService,
    DashboardOrchestratorService,
  ],
  exports: [DashboardOrchestratorService],
})
export class DashboardModule {}
