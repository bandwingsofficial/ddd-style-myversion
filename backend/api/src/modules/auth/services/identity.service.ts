import { Injectable } from '@nestjs/common';

import { ActorType } from '../domain/enums/actor-type.enum';
import { Phone } from '../domain/value-objects/phone.vo';

import { CustomerRepository } from '../repositories/customer.repository';
import { DeliveryPartnerRepository } from '../repositories/delivery-partner.repository';
import { OutletUserRepository } from '../repositories/outlet-user.repository';
import { SuperAdminRepository } from '../repositories/super-admin.repository';

import { DeliveryApprovedPolicy } from '../policies/delivery-approved.policy';
import { IdentityActivePolicy } from '../policies/identity-active.policy';

import { UnauthorizedError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';

@Injectable()
export class IdentityService {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly deliveryRepo: DeliveryPartnerRepository,
    private readonly outletUserRepo: OutletUserRepository,
    private readonly superAdminRepo: SuperAdminRepository,
  ) {}

  /* ================================================= */
  /* PUBLIC API                                        */
  /* ================================================= */

  /**
   * OTP-based login (Customer / Delivery)
   */
  async resolveByPhone(params: {
    actorType: ActorType;
    phone: string;
    autoCreate?: boolean;
  }): Promise<{ actorId: string; tokenVersion: number }> {
    const phone = Phone.fromRaw(params.phone);
    const autoCreate = params.autoCreate !== false;

    switch (params.actorType) {
      case ActorType.CUSTOMER:
        return this.resolveCustomer(phone, autoCreate);

      case ActorType.DELIVERY:
        return this.resolveDeliveryPartner(phone);

      default:
        throw new UnauthorizedError(
          AuthErrors.INVALID_CREDENTIALS,
          'Invalid credentials',
        );
    }
  }

  /**
   * Password-based login (Outlet / SuperAdmin)
   */
  async resolveByEmail(params: {
    actorType: ActorType;
    email: string;
  }): Promise<{ actorId: string; tokenVersion: number }> {
    const email = params.email.trim().toLowerCase();

    switch (params.actorType) {
      case ActorType.OUTLET_USER:
        return this.resolveOutletUser(email);

      case ActorType.SUPER_ADMIN:
        return this.resolveSuperAdmin(email);

      default:
        throw new UnauthorizedError(
          AuthErrors.INVALID_CREDENTIALS,
          'Invalid credentials',
        );
    }
  }

  /**
   * Refresh-token flow (STRICT)
   * Called only AFTER refresh token validation
   */
  async resolveById(params: {
    actorType: ActorType;
    actorId: string;
  }): Promise<{ actorId: string; tokenVersion: number }> {
    switch (params.actorType) {
      case ActorType.CUSTOMER: {
        const customer = await this.customerRepo.findById(params.actorId);
        if (!customer) {
          throw new UnauthorizedError(
            AuthErrors.UNAUTHORIZED,
            'Unauthorized',
          );
        }

        IdentityActivePolicy.check(customer);

        return {
          actorId: customer.id,
          tokenVersion: customer.tokenVersion,
        };
      }

      case ActorType.DELIVERY: {
        const partner = await this.deliveryRepo.findById(params.actorId);
        if (!partner) {
          throw new UnauthorizedError(
            AuthErrors.UNAUTHORIZED,
            'Unauthorized',
          );
        }

        IdentityActivePolicy.check(partner);
        DeliveryApprovedPolicy.check(partner);

        return {
          actorId: partner.id,
          tokenVersion: partner.tokenVersion,
        };
      }

      case ActorType.OUTLET_USER: {
        const user = await this.outletUserRepo.findById(params.actorId);
        if (!user) {
          throw new UnauthorizedError(
            AuthErrors.UNAUTHORIZED,
            'Unauthorized',
          );
        }

        IdentityActivePolicy.check(user);

        return {
          actorId: user.id,
          tokenVersion: user.tokenVersion,
        };
      }

      case ActorType.SUPER_ADMIN: {
        const admin = await this.superAdminRepo.findById(params.actorId);
        if (!admin) {
          throw new UnauthorizedError(
            AuthErrors.UNAUTHORIZED,
            'Unauthorized',
          );
        }

        IdentityActivePolicy.check(admin);

        return {
          actorId: admin.id,
          tokenVersion: admin.tokenVersion,
        };
      }

      default:
        throw new UnauthorizedError(
          AuthErrors.UNAUTHORIZED,
          'Unauthorized',
        );
    }
  }

  /* ================================================= */
  /* INTERNAL RESOLVERS                                */
  /* ================================================= */

  private async resolveCustomer(
    phone: Phone,
    autoCreate: boolean,
  ): Promise<{ actorId: string; tokenVersion: number }> {
    let customer = await this.customerRepo.findByPhone(phone);

    if (!customer) {
      if (!autoCreate) {
        throw new UnauthorizedError(
          AuthErrors.INVALID_CREDENTIALS,
          'Invalid credentials',
        );
      }

      customer = await this.customerRepo.create({ phone });
    }

    IdentityActivePolicy.check(customer);

    return {
      actorId: customer.id,
      tokenVersion: customer.tokenVersion,
    };
  }

  private async resolveDeliveryPartner(
    phone: Phone,
  ): Promise<{ actorId: string; tokenVersion: number }> {
    const partner = await this.deliveryRepo.findByPhone(phone);

    if (!partner) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(partner);
    DeliveryApprovedPolicy.check(partner);

    return {
      actorId: partner.id,
      tokenVersion: partner.tokenVersion,
    };
  }

  private async resolveOutletUser(
    email: string,
  ): Promise<{ actorId: string; tokenVersion: number }> {
    const user = await this.outletUserRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(user);

    return {
      actorId: user.id,
      tokenVersion: user.tokenVersion,
    };
  }

  private async resolveSuperAdmin(
    email: string,
  ): Promise<{ actorId: string; tokenVersion: number }> {
    const admin = await this.superAdminRepo.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(admin);

    return {
      actorId: admin.id,
      tokenVersion: admin.tokenVersion,
    };
  }
}
