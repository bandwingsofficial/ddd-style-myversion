import { authenticator } from 'otplib';

export class TotpHelper {
  static verify(code: string, secret: string): boolean {
    return authenticator.verify({
      token: code,
      secret,
    });
  }
}
