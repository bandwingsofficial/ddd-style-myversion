// src/modules/outlets/domain/value-objects/camera-state.vo.ts

import { ValidationError } from '../../../../common/errors';
import { CameraStatus } from '../enums/camera-status.enum';

export class CameraState {
  private readonly enabled: boolean;
  private readonly status: CameraStatus;
  private readonly streamUrl?: string;

  private constructor(
    enabled: boolean,
    status: CameraStatus,
    streamUrl?: string,
  ) {
    this.enabled = enabled;
    this.status = status;
    this.streamUrl = streamUrl;
    Object.freeze(this);
  }

  static disabled(): CameraState {
    return new CameraState(false, CameraStatus.OFF);
  }

  static enabledButOff(): CameraState {
    return new CameraState(true, CameraStatus.OFF);
  }

  static turnOn(streamUrl: string): CameraState {
    if (!streamUrl) {
      throw new ValidationError(
        'OUTLET_CAMERA_STREAM_REQUIRED',
        'Camera stream URL required',
      );
    }

    return new CameraState(true, CameraStatus.ON, streamUrl);
  }

  static maintenance(): CameraState {
    return new CameraState(true, CameraStatus.MAINTENANCE);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  canStream(): boolean {
    return this.enabled && this.status === CameraStatus.ON;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isUnderMaintenance(): boolean {
    return this.status === CameraStatus.MAINTENANCE;
  }

  equals(other?: CameraState): boolean {
    if (!other) return false;

    return (
      this.enabled === other.enabled &&
      this.status === other.status &&
      this.streamUrl === other.streamUrl
    );
  }

  /* ---------------------------------------------- */
  /* PERSISTENCE ONLY                               */
  /* ---------------------------------------------- */

  getRaw(): {
    isCameraEnabled: boolean;
    cameraStatus: CameraStatus;
    cameraStreamUrl?: string;
  } {
    return {
      isCameraEnabled: this.enabled,
      cameraStatus: this.status,
      cameraStreamUrl: this.streamUrl,
    };
  }
}
