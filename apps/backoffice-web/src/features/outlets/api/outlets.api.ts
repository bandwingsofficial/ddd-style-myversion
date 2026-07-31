import { axiosInstance } from '@/http/axios';
import { unwrapApiData, unwrapApiList } from '@/lib/unwrap-api-list';
import {
  CreateOutletPayload,
  Outlet,
  UpdateOutletPayload,
  WorkingStatus,
} from '../types/outlet.types';

function normalizeOutlet(raw: Outlet): Outlet {
  const workingState = raw.workingState ?? { status: 'CLOSED' as WorkingStatus };
  const cameraState = raw.cameraState ?? { status: 'OFF' as const };
  const rawRecord = raw as Outlet & {
    workingStatus?: WorkingStatus;
    cameraStatus?: Outlet['cameraState']['status'];
    cameraStreamUrl?: string;
    isCameraEnabled?: boolean;
  };

  return {
    ...raw,
    workingState: {
      status:
        workingState.status === 'OPEN'
          ? 'OPEN'
          : 'CLOSED',
    },
    cameraState: {
      enabled:
        rawRecord.isCameraEnabled ??
        cameraState.enabled ??
        false,
      status:
        cameraState.status ??
        rawRecord.cameraStatus ??
        'OFF',
      streamUrl:
        cameraState.streamUrl ??
        cameraState.cameraStreamUrl ??
        rawRecord.cameraStreamUrl ??
        undefined,
    },
    location: raw.location ?? {
      latitude: (raw as { latitude?: number }).latitude,
      longitude: (raw as { longitude?: number }).longitude,
    },
  };
}

export const OutletsApi = {
  list: async (): Promise<Outlet[]> => {
    const res = await axiosInstance.get('/outlets');
    const items = unwrapApiList<Outlet>(res.data?.data);
    return items.map(normalizeOutlet);
  },

  getById: async (id: string): Promise<Outlet | null> => {
    try {
      const res = await axiosInstance.get(`/outlets/${id}`);
      const data = unwrapApiData<Outlet>(res.data?.data);
      return data ? normalizeOutlet(data) : null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateOutletPayload): Promise<Outlet> => {
    const res = await axiosInstance.post('/outlets', payload);
    return normalizeOutlet(res.data.data);
  },

  update: async (id: string, payload: UpdateOutletPayload): Promise<Outlet> => {
    const res = await axiosInstance.post(`/outlets/${id}/update`, payload);
    return normalizeOutlet(res.data.data);
  },

  enable: async (id: string): Promise<void> => {
    await axiosInstance.post(`/outlets/${id}/enable`);
  },

  disable: async (id: string): Promise<void> => {
    await axiosInstance.post(`/outlets/${id}/disable`);
  },

  updateWorkingStatus: async (
    id: string,
    status: WorkingStatus,
  ): Promise<void> => {
    await axiosInstance.post(`/outlets/${id}/working-status`, { status });
  },

  cameraOn: async (id: string, streamUrl: string): Promise<void> => {
    await axiosInstance.post(`/outlets/${id}/camera/on`, { streamUrl });
  },

  cameraOff: async (id: string): Promise<void> => {
    await axiosInstance.post(`/outlets/${id}/camera/off`);
  },

  configureCamera: async (
    id: string,
    payload: { enabled: boolean; streamUrl?: string },
  ): Promise<Outlet> => {
    const res = await axiosInstance.post(`/outlets/${id}/camera/config`, payload);
    return normalizeOutlet(res.data.data);
  },

  delete: async (
    id: string,
    options?: { force?: boolean },
  ): Promise<{ id: string }> => {
    const res = await axiosInstance.delete(`/outlets/${id}`, {
      params: options?.force ? { force: 'true' } : undefined,
    });
    return res.data.data;
  },
};
