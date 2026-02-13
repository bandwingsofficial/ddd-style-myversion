import { ValidationError } from '../../../../common/errors';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OutletProfileProps {
  id: string;
  outletId: string;

  avatarUrl?: string;
  bannerUrl?: string;

  contactPhone?: string;
  contactEmail?: string;

  ownerName?: string;
  description?: string;

  gstNumber?: string;
  fssaiNumber?: string;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class OutletProfile {
  readonly id: string;
  readonly outletId: string;

  readonly avatarUrl?: string;
  readonly bannerUrl?: string;

  readonly contactPhone?: string;
  readonly contactEmail?: string;

  readonly ownerName?: string;
  readonly description?: string;

  readonly gstNumber?: string;
  readonly fssaiNumber?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: OutletProfileProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    outletId: string;

    avatarUrl?: string;
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
      id: params.id,
      outletId: params.outletId,

      avatarUrl: params.avatarUrl,
      bannerUrl: params.bannerUrl,

      contactPhone: params.contactPhone,
      contactEmail: params.contactEmail,

      ownerName: params.ownerName,
      description: params.description,

      gstNumber: params.gstNumber,
      fssaiNumber: params.fssaiNumber,

      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: OutletProfileProps): OutletProfile {
    return new OutletProfile(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  hasAvatar(): boolean {
    return Boolean(this.avatarUrl);
  }

  hasBanner(): boolean {
    return Boolean(this.bannerUrl);
  }

  hasBranding(): boolean {
    return this.hasAvatar() || this.hasBanner();
  }

  hasContact(): boolean {
    return Boolean(this.contactPhone || this.contactEmail);
  }

  hasComplianceInfo(): boolean {
    return Boolean(this.gstNumber || this.fssaiNumber);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  updateDetails(params: {
    avatarUrl?: string;
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

      avatarUrl: params.avatarUrl ?? this.avatarUrl,
      bannerUrl: params.bannerUrl ?? this.bannerUrl,

      contactPhone: params.contactPhone ?? this.contactPhone,
      contactEmail: params.contactEmail ?? this.contactEmail,

      ownerName: params.ownerName ?? this.ownerName,
      description: params.description ?? this.description,

      gstNumber: params.gstNumber ?? this.gstNumber,
      fssaiNumber: params.fssaiNumber ?? this.fssaiNumber,

      updatedAt: params.now ?? new Date(),
    });
  }

  updateAvatar(avatarUrl: string, now = new Date()): OutletProfile {
    return new OutletProfile({
      ...this,
      avatarUrl,
      updatedAt: now,
    });
  }

  updateBanner(bannerUrl: string, now = new Date()): OutletProfile {
    return new OutletProfile({
      ...this,
      bannerUrl,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
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
