export class TokenTimeHelper {
  static expiresAt(ttlSeconds: number): Date {
    return new Date(Date.now() + ttlSeconds * 1000);
  }
}
