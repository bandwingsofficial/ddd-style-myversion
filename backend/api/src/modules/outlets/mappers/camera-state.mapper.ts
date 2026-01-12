// src/modules/outlets/mappers/camera-state.mapper.ts

import { CameraState } from '../domain/value-objects/camera-state.vo';
import { CameraStatusMapper } from './camera-status.mapper';

export class CameraStateMapper {
  static toDomain(params: {
    isCameraEnabled: boolean;
    cameraStatus: any;
    cameraStreamUrl?: string | null;
  }): CameraState {
    if (!params.isCameraEnabled) {
      return CameraState.disabled();
    }

    const status = CameraStatusMapper.toDomain(
      params.cameraStatus,
    );

    switch (status) {
      case 'ON':
        return CameraState.turnOn(params.cameraStreamUrl!);

      case 'MAINTENANCE':
        return CameraState.maintenance();

      case 'OFF':
      default:
        return CameraState.enabledButOff();
    }
  }

  static toPrisma(camera: CameraState): {
    isCameraEnabled: boolean;
    cameraStatus: any;
    cameraStreamUrl?: string | null;
  } {
    const raw = camera.getRaw();

    return {
      isCameraEnabled: raw.isCameraEnabled,
      cameraStatus: CameraStatusMapper.toPrisma(
        raw.cameraStatus,
      ),
      cameraStreamUrl: raw.cameraStreamUrl ?? null,
    };
  }
}
