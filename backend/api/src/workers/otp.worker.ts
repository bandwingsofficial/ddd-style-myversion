import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { SmsProvider } from '../infrastructure/providers/sms/sms.provider';
import { OTP_JOBS, OTP_QUEUE } from '../infrastructure/queue/queues/otp.queue';

interface SendOtpJob {
  phone: string;
  otp: string;
  actorType: string;
  purpose: string;
}

@Processor(OTP_QUEUE)
export class OtpWorker {
  private readonly logger = new Logger(OtpWorker.name);

  constructor(private readonly sms: SmsProvider) {}

  @Process(OTP_JOBS.SEND)
  async handleSendOtp(job: Job<SendOtpJob>): Promise<void> {
    const { phone, otp, actorType, purpose } = job.data;

    this.logger.debug(`Sending OTP to ${phone} [${actorType}/${purpose}]`);

    try {
      await this.sms.sendOtp(phone, otp);
    } catch (error) {
      this.logger.error(
        `Failed to send OTP to ${phone}`,
        error instanceof Error ? error.stack : undefined,
      );

      // IMPORTANT:
      // Throwing re-triggers Bull retry mechanism
      throw error;
    }
  }
}
