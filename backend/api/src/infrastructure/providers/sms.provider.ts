import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);

  async sendOtp(phone: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `[DEV SMS] ${phone} → OTP: ${otp}`,
      );
      return;
    }

    // 🚨 IMPORTANT:
    // In production, this MUST be implemented.
    // Throwing ensures Bull retries the job.
    this.logger.error(
      `SMS provider not configured. Failed to send OTP to ${phone}`,
    );

    throw new Error('SMS_PROVIDER_NOT_CONFIGURED');
  }
}
