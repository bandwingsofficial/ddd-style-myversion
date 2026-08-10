import { CustomerAccountDeletionService } from './customer-account-deletion.service';
import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';
import { Phone } from '../domain/value-objects/phone.vo';
import { Customer } from '../domain/models/customer.model';
import { AuthErrors } from '../constants/auth-errors';
import { ValidationError } from '../../../common/errors';

describe('CustomerAccountDeletionService', () => {
  const phone = '+919876543210';
  const customerId = 'cust_1';

  const customer = Customer.rehydrate({
    id: customerId,
    phone: Phone.fromRaw(phone),
    isBlocked: false,
    tokenVersion: 1,
    createdAt: new Date('2026-01-01'),
  });

  const prisma = {
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prisma),
    ),
    order: {
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    authSession: {
      findMany: jest.fn().mockResolvedValue([{ id: 'sess_1' }]),
    },
  };

  const redis = {
    del: jest.fn().mockResolvedValue(undefined),
  };

  const customerRepo = {
    findById: jest.fn(),
    findByPhone: jest.fn(),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };

  const auditRepo = {
    create: jest.fn().mockResolvedValue(undefined),
  };

  const sessionRepo = {
    findActiveByActor: jest.fn().mockResolvedValue([{ id: 'sess_1' }]),
    revokeAllForActor: jest.fn().mockResolvedValue(1),
  };

  const refreshTokenRepo = {
    revokeBySessionId: jest.fn().mockResolvedValue(1),
  };

  const otpRepo = {
    deleteByPhone: jest.fn().mockResolvedValue(1),
  };

  const mfaRepo = {
    deleteByActor: jest.fn().mockResolvedValue(0),
  };

  const otpService = {
    requestOtp: jest.fn().mockResolvedValue({
      cooldownSeconds: 60,
      remainingResends: 9,
    }),
    verifyOtp: jest.fn().mockResolvedValue(undefined),
  };

  let service: CustomerAccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerRepo.findById.mockResolvedValue(customer);
    customerRepo.findByPhone.mockResolvedValue(customer);

    service = new CustomerAccountDeletionService(
      prisma as any,
      redis as any,
      customerRepo as any,
      auditRepo as any,
      sessionRepo as any,
      refreshTokenRepo as any,
      otpRepo as any,
      mfaRepo as any,
      otpService as any,
    );
  });

  it('requests public deletion OTP with SENSITIVE_ACTION purpose', async () => {
    await service.requestDeletionOtp({ phone });

    expect(otpService.requestOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        actorType: ActorType.CUSTOMER,
        phone,
        purpose: OtpPurpose.SENSITIVE_ACTION,
      }),
    );
  });

  it('deletes authenticated customer without OTP', async () => {
    const result = await service.deleteAuthenticatedAccount({
      customerId,
      sessionId: 'sess_1',
    });

    expect(result).toEqual({ deleted: true });
    expect(otpService.verifyOtp).not.toHaveBeenCalled();
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: { customerId },
      data: { customerId: null },
    });
    expect(sessionRepo.revokeAllForActor).toHaveBeenCalledWith(
      ActorType.CUSTOMER,
      customerId,
      prisma,
    );
    expect(refreshTokenRepo.revokeBySessionId).toHaveBeenCalled();
    expect(otpRepo.deleteByPhone).toHaveBeenCalledWith(phone, prisma);
    expect(mfaRepo.deleteByActor).toHaveBeenCalledWith(
      ActorType.CUSTOMER,
      customerId,
      prisma,
    );
    expect(auditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CUSTOMER_ACCOUNT_DELETED,
        actorId: customerId,
      }),
      prisma,
    );
    expect(customerRepo.deleteById).toHaveBeenCalledWith(customerId, prisma);
    expect(redis.del).toHaveBeenCalled();
  });

  it('rejects authenticated delete when customer is missing', async () => {
    customerRepo.findById.mockResolvedValue(null);

    await expect(
      service.deleteAuthenticatedAccount({
        customerId: 'other',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(customerRepo.deleteById).not.toHaveBeenCalled();
  });

  it('only deletes the authenticated customer id provided by JWT context', async () => {
    await service.deleteAuthenticatedAccount({ customerId });

    expect(customerRepo.findById).toHaveBeenCalledWith(customerId);
    expect(customerRepo.deleteById).toHaveBeenCalledWith(customerId, prisma);
    expect(customerRepo.findByPhone).not.toHaveBeenCalled();
  });

  it('deletes by phone after public OTP verification', async () => {
    const result = await service.deleteAccountByPhone({
      phone,
      otp: '654321',
    });

    expect(result).toEqual({ deleted: true });
    expect(otpService.verifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        phone,
        purpose: OtpPurpose.SENSITIVE_ACTION,
        otp: '654321',
      }),
    );
    expect(customerRepo.deleteById).toHaveBeenCalledWith(customerId, prisma);
  });

  it('fails public deletion when OTP verification fails', async () => {
    otpService.verifyOtp.mockRejectedValueOnce(
      new ValidationError(AuthErrors.INVALID_OTP, 'Invalid OTP'),
    );

    await expect(
      service.deleteAccountByPhone({
        phone,
        otp: '000000',
      }),
    ).rejects.toMatchObject({ code: AuthErrors.INVALID_OTP });

    expect(customerRepo.deleteById).not.toHaveBeenCalled();
  });

  it('returns success without delete when phone has no account (anti-enumeration)', async () => {
    customerRepo.findByPhone.mockResolvedValue(null);

    const result = await service.deleteAccountByPhone({
      phone,
      otp: '654321',
    });

    expect(result).toEqual({ deleted: true });
    expect(otpService.verifyOtp).toHaveBeenCalled();
    expect(customerRepo.deleteById).not.toHaveBeenCalled();
  });

  it('does not delete orders — only detaches customerId', async () => {
    await service.deleteAuthenticatedAccount({ customerId });

    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: { customerId },
      data: { customerId: null },
    });
    expect((prisma as any).order.deleteMany).toBeUndefined();
  });
});
