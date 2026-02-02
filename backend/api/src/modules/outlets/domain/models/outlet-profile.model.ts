import { ValidationError } from '../../../../common/errors';

/**
 * OutletProfile (Domain Entity)
 *
 * Pure domain model
 * Immutable
 * No Prisma / DTO types
 */
export class OutletProfile {
  readonly id: string;
  readonly outletId: string;

  readonly logoUrl?: string;
  readonly bannerUrl?: string;

  readonly contactPhone?: string;
  readonly contactEmail?: string;

  readonly ownerName?: string;
  readonly description?: string;

  readonly gstNumber?: string;
  readonly fssaiNumber?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    outletId: string;

    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;

    createdAt: Date;
    updatedAt: Date;
  }) {
    Object.assign(this, params);

    this.assertValid();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    outletId: string;

    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;

    now?: Date;
  }): OutletProfile {
    const now = params.now ?? new Date();

    return new OutletProfile({
      ...params,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Repository only
   */
  static rehydrate(params: {
    id: string;
    outletId: string;

    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;

    createdAt: Date;
    updatedAt: Date;
  }): OutletProfile {
    return new OutletProfile(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  updateDetails(params: {
    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;

    now?: Date;
  }): OutletProfile {
    return new OutletProfile({
      ...this,
      ...params,
      updatedAt: params.now ?? new Date(),
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  hasBranding(): boolean {
    return Boolean(this.logoUrl || this.bannerUrl);
  }

  hasContact(): boolean {
    return Boolean(this.contactPhone || this.contactEmail);
  }

  hasComplianceInfo(): boolean {
    return Boolean(this.gstNumber || this.fssaiNumber);
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValid(): void {
    if (!this.outletId) {
      throw new ValidationError(
        'OUTLET_PROFILE_OUTLET_REQUIRED',
        'OutletProfile must belong to an outlet',
      );
    }

    if (this.ownerName && this.ownerName.length > 120) {
      throw new ValidationError(
        'OUTLET_PROFILE_OWNER_TOO_LONG',
        'Owner name too long',
      );
    }

    if (this.description && this.description.length > 500) {
      throw new ValidationError(
        'OUTLET_PROFILE_DESCRIPTION_TOO_LONG',
        'Description too long',
      );
    }

    if (
      this.contactEmail &&
      !this.contactEmail.includes('@')
    ) {
      throw new ValidationError(
        'OUTLET_PROFILE_INVALID_EMAIL',
        'Invalid contact email',
      );
    }
  }
}
