// src/modules/auth/domain/models/delivery-partner.model.ts

import { ValidationError } from '../../../../common/errors';
import { DeliveryStatus } from '../enums/delivery-status.enum';
import { Phone } from '../value-objects/phone.vo';

/**
 * DeliveryPartner aggregate root (auth perspective).
 * Handles:
 * - onboarding lifecycle (KYC → approval)
 * - blocked / suspended access
 * - tokenVersion for global invalidation
 */
export class DeliveryPartner {
  readonly id: string;
  readonly phone: Phone;

  readonly status: DeliveryStatus;
  readonly kycRefId?: string;

  readonly approvedAt?: Date;
  readonly approvedBy?: string;

  readonly tokenVersion: number;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    phone: Phone;
    status: DeliveryStatus;
    kycRefId?: string;
    approvedAt?: Date;
    approvedBy?: string;
    tokenVersion: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.phone = params.phone;

    this.status = params.status;
    this.kycRefId = params.kycRefId;

    this.approvedAt = params.approvedAt;
    this.approvedBy = params.approvedBy;

    this.tokenVersion = params.tokenVersion;
    this.createdAt = params.createdAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    phone: Phone;
    now?: Date;
  }): DeliveryPartner {
    const now = params.now ?? new Date();

    return new DeliveryPartner({
      id: params.id,
      phone: params.phone,
      status: DeliveryStatus.CREATED,
      tokenVersion: 0,
      createdAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    phone: Phone;
    status: DeliveryStatus;
    kycRefId?: string;
    approvedAt?: Date;
    approvedBy?: string;
    tokenVersion: number;
    createdAt: Date;
  }): DeliveryPartner {
    return new DeliveryPartner(params);
  }

  /* ---------------------------------------------- */
  /* DERIVED STATE                                  */
  /* ---------------------------------------------- */

  get isApproved(): boolean {
    return this.status === DeliveryStatus.APPROVED;
  }

  get isBlocked(): boolean {
    return (
      this.status === DeliveryStatus.BLOCKED ||
      this.status === DeliveryStatus.SUSPENDED
    );
  }

  canLogin(): boolean {
    return this.isApproved && !this.isBlocked;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  submitKyc(kycRefId: string): DeliveryPartner {
    if (this.status !== DeliveryStatus.CREATED) {
      throw new ValidationError(
        'DELIVERY_PARTNER_INVALID_KYC_SUBMISSION',
        'KYC can only be submitted from CREATED state',
        { deliveryPartnerId: this.id, status: this.status },
      );
    }

    return new DeliveryPartner({
      id: this.id,
      phone: this.phone,
      status: DeliveryStatus.KYC_SUBMITTED,
      kycRefId,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  approve(params: { approvedBy: string; now?: Date }): DeliveryPartner {
    if (this.status !== DeliveryStatus.KYC_SUBMITTED) {
      throw new ValidationError(
        'DELIVERY_PARTNER_INVALID_APPROVAL_STATE',
        'Delivery partner can only be approved after KYC submission',
        { deliveryPartnerId: this.id, status: this.status },
      );
    }

    const now = params.now ?? new Date();

    return new DeliveryPartner({
      id: this.id,
      phone: this.phone,
      status: DeliveryStatus.APPROVED,
      kycRefId: this.kycRefId,
      approvedAt: now,
      approvedBy: params.approvedBy,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  suspend(): DeliveryPartner {
    if (this.status === DeliveryStatus.SUSPENDED) return this;

    return new DeliveryPartner({
      id: this.id,
      phone: this.phone,
      status: DeliveryStatus.SUSPENDED,
      kycRefId: this.kycRefId,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  block(): DeliveryPartner {
    if (this.status === DeliveryStatus.BLOCKED) return this;

    return new DeliveryPartner({
      id: this.id,
      phone: this.phone,
      status: DeliveryStatus.BLOCKED,
      kycRefId: this.kycRefId,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  bumpTokenVersion(): DeliveryPartner {
    return new DeliveryPartner({
      id: this.id,
      phone: this.phone,
      status: this.status,
      kycRefId: this.kycRefId,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      tokenVersion: this.tokenVersion + 1,
      createdAt: this.createdAt,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.tokenVersion < 0) {
      throw new ValidationError(
        'DELIVERY_PARTNER_INVALID_TOKEN_VERSION',
        'DeliveryPartner tokenVersion cannot be negative',
        { tokenVersion: this.tokenVersion },
      );
    }

    // KYC rules
    if (this.status === DeliveryStatus.KYC_SUBMITTED && !this.kycRefId) {
      throw new ValidationError(
        'DELIVERY_PARTNER_KYC_REF_REQUIRED',
        'KYC_SUBMITTED delivery partner must have kycRefId',
        { deliveryPartnerId: this.id },
      );
    }

    if (this.status === DeliveryStatus.CREATED && this.kycRefId) {
      throw new ValidationError(
        'DELIVERY_PARTNER_KYC_REF_NOT_ALLOWED',
        'CREATED delivery partner cannot have kycRefId',
        { deliveryPartnerId: this.id },
      );
    }

    // Approval rules
    if (this.status === DeliveryStatus.APPROVED) {
      if (!this.approvedAt || !this.approvedBy) {
        throw new ValidationError(
          'DELIVERY_PARTNER_APPROVAL_METADATA_REQUIRED',
          'APPROVED delivery partner must have approvedAt and approvedBy',
          { deliveryPartnerId: this.id },
        );
      }
    }

    if (
      this.status !== DeliveryStatus.APPROVED &&
      (this.approvedAt || this.approvedBy)
    ) {
      throw new ValidationError(
        'DELIVERY_PARTNER_APPROVAL_METADATA_NOT_ALLOWED',
        'Non-approved delivery partner cannot have approval metadata',
        { deliveryPartnerId: this.id },
      );
    }

    // Timeline safety
    if (this.approvedAt && this.approvedAt < this.createdAt) {
      throw new ValidationError(
        'DELIVERY_PARTNER_INVALID_APPROVAL_TIME',
        'approvedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          approvedAt: this.approvedAt,
        },
      );
    }
  }
}
