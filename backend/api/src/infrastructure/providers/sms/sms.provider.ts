import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async sendOtp(phone: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[DEV SMS] ${phone} → OTP: ${otp}`);
      return;
    }

    const formattedPhone = this.formatPhone(phone);

    const message = `Dear Customer ${otp} is the OTP for your login at CANTEN. In case you have not requested this, please contact us at https://canten.online`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(process.env.SMS_API_URL!, {
          params: {
            user: process.env.SMS_USERNAME,
            pass: process.env.SMS_PASSWORD,
            sender: process.env.SMS_SENDER,
            phone: formattedPhone,
            text: message,
            priority: process.env.SMS_PRIORITY || 'ndnd',
            stype: process.env.SMS_STYPE || 'normal',
          },
          timeout: 10000,
        }),
      );

      const result = String(response.data).trim();

      this.logger.debug(`SMS Gateway Response: ${result}`);

      /**
       * Gateway success examples:
       * 123456
       * S.123456
       */

      const successRegex = /^(S\.)?\d+$/;

      if (!successRegex.test(result)) {
        this.logger.error(`SMS failed for ${formattedPhone}: ${result}`);
        throw new Error(result);
      }

      const messageId = result.startsWith('S.')
        ? result.substring(2)
        : result;

      this.logger.log(
        `SMS successfully sent to ${formattedPhone}. MessageId: ${messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send OTP to ${formattedPhone}`,
        error?.response?.data || error.message,
      );

      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Gateway requires only 10 digit mobile number.
   */
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2);
    }

    return cleaned;
  }
}