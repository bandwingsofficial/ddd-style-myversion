import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardResponseMapper {
  wrap<T>(data: T, message = 'Dashboard data fetched successfully') {
    return {
      success: true,
      code: 'DASHBOARD_DATA_FETCHED',
      message,
      data,
      generatedAt: new Date().toISOString(),
    };
  }
}
