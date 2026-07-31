import { OutletsApi } from './api/outlets.api';
import {
  Outlet,
  OutletStatus,
  WorkingStatus,
} from './types/outlet.types';

export type { Outlet, OutletStatus, WorkingStatus };

export const OutletService = {
  getAll: () => OutletsApi.list(),

  getById: (id: string) => OutletsApi.getById(id),

  create: OutletsApi.create,

  update: OutletsApi.update,

  disable: OutletsApi.disable,

  enable: OutletsApi.enable,

  updateWorkingStatus: OutletsApi.updateWorkingStatus,

  cameraOn: OutletsApi.cameraOn,

  cameraOff: OutletsApi.cameraOff,
};
