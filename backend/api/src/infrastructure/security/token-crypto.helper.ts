import * as crypto from 'crypto';

export class TokenCryptoHelper {
  static generateRandomHex(bytes: number): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static hash(
    value: string,
    algorithm: string = 'sha256',
  ): string {
    return crypto.createHash(algorithm).update(value).digest('hex');
  }
}
