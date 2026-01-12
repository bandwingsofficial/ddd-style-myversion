// src/modules/auth/domain/value-objects/device-info.vo.ts

import { ValidationError } from '../../../../common/errors';

export interface DeviceInfoProps {
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Represents request-origin metadata.
 * - NOT a fingerprint
 * - NOT a security identifier
 * - Used only for auditing, session context, and heuristics
 */
export class DeviceInfo {
  readonly deviceId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;

  private constructor(props: DeviceInfoProps) {
    this.deviceId = props.deviceId;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    Object.freeze(this);
  }

  static create(props?: DeviceInfoProps): DeviceInfo {
    if (!props) {
      return new DeviceInfo({});
    }

    const deviceId = DeviceInfo.normalize(props.deviceId);
    const ipAddress = DeviceInfo.normalize(props.ipAddress);
    const userAgent = DeviceInfo.normalize(props.userAgent);

    if (ipAddress && !DeviceInfo.isValidIp(ipAddress)) {
      throw new ValidationError(
        'DEVICE_INFO_INVALID_IP',
        'Invalid IP address',
        { ipAddress },
      );
    }

    if (deviceId && (deviceId.length < 6 || deviceId.length > 128)) {
      throw new ValidationError(
        'DEVICE_INFO_INVALID_DEVICE_ID',
        'Invalid deviceId',
        { deviceId },
      );
    }

    if (userAgent && userAgent.length > 512) {
      throw new ValidationError(
        'DEVICE_INFO_INVALID_USER_AGENT',
        'Invalid userAgent',
        { userAgent },
      );
    }

    return new DeviceInfo({
      deviceId,
      ipAddress,
      userAgent,
    });
  }

  equals(other?: DeviceInfo): boolean {
    if (!other) return false;

    return (
      this.deviceId === other.deviceId &&
      this.ipAddress === other.ipAddress &&
      this.userAgent === other.userAgent
    );
  }

  toJSON(): DeviceInfoProps {
    return {
      deviceId: this.deviceId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    };
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private static normalize(value?: string): string | undefined {
    if (!value) return undefined;

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private static isValidIp(ip: string): boolean {
    // IPv4
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    // Relaxed IPv6 (supports compressed forms)
    const ipv6 =
      /^(([0-9a-fA-F]{1,4}:){1,7}:?|:)((:[0-9a-fA-F]{1,4}){1,7})$/;

    return ipv4.test(ip) || ipv6.test(ip);
  }
}
