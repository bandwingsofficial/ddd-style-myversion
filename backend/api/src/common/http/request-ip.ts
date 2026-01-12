// src/common/http/request-ip.ts
import { Request } from 'express';
import net from 'node:net';

export function getRequestIp(req: Request): string | undefined {
  let ip: string | undefined;

  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    ip = xff.split(',')[0].trim();
  } else {
    ip =
      req.socket?.remoteAddress ||
      req.ip ||
      undefined;
  }

  if (!ip) return undefined;

  // IPv6 → IPv4 mapping
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // IPv6 localhost
  if (ip === '::1') {
    return '127.0.0.1';
  }

  // Accept IPv4 or IPv6 only
  return net.isIP(ip) ? ip : undefined;
}
