import { ValidationError } from '../../../common/errors';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface CustomerProfileProps {
  id: string;
  customerId: string;

  fullName?: string;
  email?: string;
  avatarUrl?: string;

  gender?: string;
  dob?: Date;

  referralCode?: string;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class CustomerProfile {
  readonly id: string;
  readonly customerId: string;

  readonly fullName?: string;
  readonly email?: string;
  readonly avatarUrl?: string;

  readonly gender?: string;
  readonly dob?: Date;

  readonly referralCode?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CustomerProfileProps) {
    Object.assign(this, {
      ...props,
      email: props.email?.toLowerCase(), // normalize
    });

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    customerId: string;

    fullName?: string;
    email?: string;
    avatarUrl?: string;

    gender?: string;
    dob?: Date;
    referralCode?: string;

    now?: Date;
  }): CustomerProfile {
    const now = params.now ?? new Date();

    return new CustomerProfile({
      id: params.id,
      customerId: params.customerId,

      fullName: params.fullName,
      email: params.email,
      avatarUrl: params.avatarUrl,

      gender: params.gender,
      dob: params.dob,
      referralCode: params.referralCode,

      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CustomerProfileProps): CustomerProfile {
    return new CustomerProfile(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  hasProfile(): boolean {
    return !!(this.fullName || this.email || this.avatarUrl);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  updateDetails(params: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
    now?: Date;
  }): CustomerProfile {
    return new CustomerProfile({
      ...this,
      fullName: params.fullName ?? this.fullName,
      email: params.email ?? this.email,
      avatarUrl: params.avatarUrl ?? this.avatarUrl,
      gender: params.gender ?? this.gender,
      dob: params.dob ?? this.dob,
      updatedAt: params.now ?? new Date(),
    });
  }

  changeAvatar(avatarUrl: string, now = new Date()): CustomerProfile {
    return new CustomerProfile({
      ...this,
      avatarUrl,
      updatedAt: now,
    });
  }

  clearAvatar(now = new Date()): CustomerProfile {
    return new CustomerProfile({
      ...this,
      avatarUrl: undefined,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.fullName && this.fullName.length > 120) {
      throw new ValidationError(
        'PROFILE_NAME_TOO_LONG',
        'Full name must not exceed 120 characters',
      );
    }

    if (this.email && this.email.length > 150) {
      throw new ValidationError(
        'PROFILE_EMAIL_TOO_LONG',
        'Email too long',
      );
    }

    if (!this.customerId) {
      throw new ValidationError(
        'PROFILE_INVALID_CUSTOMER',
        'Customer id is required',
      );
    }
  }
}
