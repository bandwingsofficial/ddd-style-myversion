import { ValidationError } from '../../../../common/errors';

/**
 * SuperAdminProfile
 * ------------------------------------------------
 * Immutable aggregate
 * - One-to-one with SuperAdmin
 * - Pure profile metadata only
 */
export class SuperAdminProfile {
  readonly id: string;
  readonly superAdminId: string;

  readonly fullName: string;
  readonly avatarUrl?: string;
  readonly title?: string;

  readonly phone?: string;
  readonly notes?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  /* ------------------------------------------ */
  /* CONSTRUCTOR (private → force factories)    */
  /* ------------------------------------------ */

  private constructor(params: {
    id: string;
    superAdminId: string;

    fullName: string;
    avatarUrl?: string;
    title?: string;

    phone?: string;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
  }) {
    Object.assign(this, {
      ...params,
      avatarUrl: params.avatarUrl ?? undefined,
      title: params.title ?? undefined,
      phone: params.phone ?? undefined,
      notes: params.notes ?? undefined,
    });

    this.assertValid();

    Object.freeze(this);
  }

  /* ------------------------------------------ */
  /* FACTORIES                                  */
  /* ------------------------------------------ */

  static createNew(params: {
    id: string;
    superAdminId: string;

    fullName: string;
    avatarUrl?: string;
    title?: string;

    phone?: string;
    notes?: string;
  }): SuperAdminProfile {
    const now = new Date();

    return new SuperAdminProfile({
      ...params,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    superAdminId: string;

    fullName: string;
    avatarUrl?: string | null;
    title?: string | null;

    phone?: string | null;
    notes?: string | null;

    createdAt: Date;
    updatedAt: Date;
  }): SuperAdminProfile {
    return new SuperAdminProfile({
      ...params,
      avatarUrl: params.avatarUrl ?? undefined,
      title: params.title ?? undefined,
      phone: params.phone ?? undefined,
      notes: params.notes ?? undefined,
    });
  }

  /* ------------------------------------------ */
  /* DOMAIN QUERIES                              */
  /* ------------------------------------------ */

  hasAvatar(): boolean {
    return Boolean(this.avatarUrl);
  }

  /* ------------------------------------------ */
  /* DOMAIN TRANSITIONS                          */
  /* ------------------------------------------ */

  updateDetails(params: {
    fullName?: string;
    title?: string;
    phone?: string;
    notes?: string;
  }): SuperAdminProfile {
    return new SuperAdminProfile({
      ...this,
      fullName: params.fullName ?? this.fullName,
      title: params.title ?? this.title,
      phone: params.phone ?? this.phone,
      notes: params.notes ?? this.notes,
      updatedAt: new Date(),
    });
  }

  changeAvatar(
    avatarUrl: string,
  ): SuperAdminProfile {
    return new SuperAdminProfile({
      ...this,
      avatarUrl,
      updatedAt: new Date(),
    });
  }

  clearAvatar(): SuperAdminProfile {
    return new SuperAdminProfile({
      ...this,
      avatarUrl: undefined,
      updatedAt: new Date(),
    });
  }

  /* ------------------------------------------ */
  /* INVARIANTS                                  */
  /* ------------------------------------------ */

  private assertValid() {
    if (!this.fullName || !this.fullName.trim()) {
      throw new ValidationError(
        'SUPER_ADMIN_NAME_REQUIRED',
        'Full name is required',
      );
    }

    if (this.fullName.length > 120) {
      throw new ValidationError(
        'SUPER_ADMIN_NAME_TOO_LONG',
        'Full name too long',
      );
    }

    if (this.title && this.title.length > 100) {
      throw new ValidationError(
        'SUPER_ADMIN_TITLE_TOO_LONG',
        'Title too long',
      );
    }

    if (this.notes && this.notes.length > 1000) {
      throw new ValidationError(
        'SUPER_ADMIN_NOTES_TOO_LONG',
        'Notes too long',
      );
    }
  }
}
