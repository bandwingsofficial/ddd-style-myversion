// src/modules/auth/domain/enums/audit-action.enum.ts

export enum AuditAction {
  /* ================================================= */
  /* OTP                                               */
  /* ================================================= */
  OTP_REQUESTED = 'OTP_REQUESTED',
  OTP_VERIFICATION_FAILED = 'OTP_VERIFICATION_FAILED',
  OTP_VERIFIED = 'OTP_VERIFIED',

  /* ================================================= */
  /* Authentication / Login                            */
  /* ================================================= */
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  MFA_FAILED = 'MFA_FAILED',

  /* ================================================= */
  /* Tokens                                            */
  /* ================================================= */
  TOKEN_ISSUED = 'TOKEN_ISSUED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',

  /* ================================================= */
  /* Sessions                                          */
  /* ================================================= */
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  SESSION_REVOKED = 'SESSION_REVOKED',

  /* ================================================= */
  /* Delivery lifecycle                                */
  /* ================================================= */
  DELIVERY_APPROVED = 'DELIVERY_APPROVED',
  DELIVERY_REJECTED = 'DELIVERY_REJECTED',
  DELIVERY_SUSPENDED = 'DELIVERY_SUSPENDED',
  DELIVERY_BLOCKED = 'DELIVERY_BLOCKED',

  /* ================================================= */
  /* Outlet users                                      */
  /* ================================================= */
  OUTLET_USER_CREATED = 'OUTLET_USER_CREATED',
  OUTLET_USER_DISABLED = 'OUTLET_USER_DISABLED',
  OUTLET_USER_PASSWORD_RESET = 'OUTLET_USER_PASSWORD_RESET',
  OUTLET_USER_ENABLED = 'OUTLET_USER_ENABLED',
  OUTLET_USER_DELETED = 'OUTLET_USER_DELETED',

  /* ================================================= */
  /* Outlets                                           */
  /* ================================================= */
  OUTLET_CREATED = 'OUTLET_CREATED',
  OUTLET_UPDATED = 'OUTLET_UPDATED', // ✅ ADDED
  OUTLET_ENABLED = 'OUTLET_ENABLED',
  OUTLET_DISABLED = 'OUTLET_DISABLED',

  OUTLET_OPENED = 'OUTLET_OPENED',
  OUTLET_CLOSED = 'OUTLET_CLOSED',
  OUTLET_TEMPORARILY_CLOSED = 'OUTLET_TEMPORARILY_CLOSED',

  OUTLET_CAMERA_ON = 'OUTLET_CAMERA_ON',
  OUTLET_CAMERA_OFF = 'OUTLET_CAMERA_OFF',
  OUTLET_CAMERA_MAINTENANCE = 'OUTLET_CAMERA_MAINTENANCE',

  /* ================================================= */
  /* Super admin                                       */
  /* ================================================= */
  SUPER_ADMIN_LOGIN = 'SUPER_ADMIN_LOGIN',
  SUPER_ADMIN_ACTION = 'SUPER_ADMIN_ACTION',
}
