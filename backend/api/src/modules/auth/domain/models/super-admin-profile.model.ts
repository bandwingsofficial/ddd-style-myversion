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
    Object.assign(this, params);

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
    avatarUrl?: string;
    title?: string;

    phone?: string;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
  }): SuperAdminProfile {
    return new SuperAdminProfile(params);
  }

  /* ------------------------------------------ */
  /* DOMAIN TRANSITIONS                          */
  /* ------------------------------------------ */

  update(params: {
    fullName?: string;
    avatarUrl?: string;
    title?: string;
    phone?: string;
    notes?: string;
  }): SuperAdminProfile {
    return new SuperAdminProfile({
      ...this,
      ...params,
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
