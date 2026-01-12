// src/modules/auth/repositories/mappers/otp-purpose.mapper.ts

import { OtpPurpose as PrismaOtpPurpose } from '@prisma/client';
import { OtpPurpose as DomainOtpPurpose } from '../domain/enums/otp-purpose.enum';

export class OtpPurposeMapper {
  static toPrisma(purpose: DomainOtpPurpose): PrismaOtpPurpose {
    switch (purpose) {
      case DomainOtpPurpose.LOGIN:
        return PrismaOtpPurpose.LOGIN;

      case DomainOtpPurpose.VERIFY_PHONE:
        return PrismaOtpPurpose.VERIFY_PHONE;

      case DomainOtpPurpose.SENSITIVE_ACTION:
        return PrismaOtpPurpose.SENSITIVE_ACTION;

      default:
        // Exhaustive safety
        throw new Error(`Unsupported Domain OtpPurpose: ${purpose}`);
    }
  }

  static toDomain(purpose: PrismaOtpPurpose): DomainOtpPurpose {
    switch (purpose) {
      case PrismaOtpPurpose.LOGIN:
        return DomainOtpPurpose.LOGIN;

      case PrismaOtpPurpose.VERIFY_PHONE:
        return DomainOtpPurpose.VERIFY_PHONE;

      case PrismaOtpPurpose.SENSITIVE_ACTION:
        return DomainOtpPurpose.SENSITIVE_ACTION;

      default:
        // Exhaustive safety
        throw new Error(`Unsupported Prisma OtpPurpose: ${purpose}`);
    }
  }
}
