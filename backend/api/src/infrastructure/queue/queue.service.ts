import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';

import { OTP_JOBS } from './queues/otp.queue';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('otp')
    private readonly otpQueue: Queue,
  ) {}

  /* ================================================= */
  /* INTERNAL DEFAULT OPTIONS                          */
  /* ================================================= */

  private readonly defaultOptions: JobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  };

  /* ================================================= */
  /* OTP QUEUE                                        */
  /* ================================================= */

  async addOtpJob(
    name: (typeof OTP_JOBS)[keyof typeof OTP_JOBS],
    payload: {
      phone: string;
      otp: string;
      actorType: string;
      purpose: string;
    },
  ): Promise<void> {
    await this.otpQueue.add(name, payload, this.defaultOptions);
  }

  /* ================================================= */
  /* GENERIC (OPTIONAL, FUTURE USE)                    */
  /* ================================================= */

  async addJob(
    queue: Queue,
    name: string,
    payload: Record<string, any>,
    options?: JobOptions,
  ): Promise<void> {
    await queue.add(name, payload, {
      ...this.defaultOptions,
      ...options,
    });
  }
}
