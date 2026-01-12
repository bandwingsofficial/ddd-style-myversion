import { AuditAction as PrismaAuditAction } from '@prisma/client';
import { AuditAction as DomainAuditAction } from '../domain/enums/audit-action.enum';

export class AuditActionMapper {
  static toPrisma(action: DomainAuditAction): PrismaAuditAction {
    switch (action) {
      /* ================================================= */
      /* OTP                                               */
      /* ================================================= */
      case DomainAuditAction.OTP_REQUESTED:
        return PrismaAuditAction.OTP_REQUESTED;
      case DomainAuditAction.OTP_VERIFICATION_FAILED:
        return PrismaAuditAction.OTP_VERIFICATION_FAILED;
      case DomainAuditAction.OTP_VERIFIED:
        return PrismaAuditAction.OTP_VERIFIED;

      /* ================================================= */
      /* Authentication / Login                            */
      /* ================================================= */
      case DomainAuditAction.LOGIN_SUCCESS:
        return PrismaAuditAction.LOGIN_SUCCESS;
      case DomainAuditAction.LOGIN_FAILED:
        return PrismaAuditAction.LOGIN_FAILED;
      case DomainAuditAction.MFA_FAILED:
        return PrismaAuditAction.MFA_FAILED;

      /* ================================================= */
      /* Tokens                                            */
      /* ================================================= */
      case DomainAuditAction.TOKEN_ISSUED:
        return PrismaAuditAction.TOKEN_ISSUED;
      case DomainAuditAction.TOKEN_REFRESHED:
        return PrismaAuditAction.TOKEN_REFRESHED;
      case DomainAuditAction.TOKEN_REUSE_DETECTED:
        return PrismaAuditAction.TOKEN_REUSE_DETECTED;

      /* ================================================= */
      /* Sessions                                          */
      /* ================================================= */
      case DomainAuditAction.LOGOUT:
        return PrismaAuditAction.LOGOUT;
      case DomainAuditAction.LOGOUT_ALL:
        return PrismaAuditAction.LOGOUT_ALL;
      case DomainAuditAction.SESSION_REVOKED:
        return PrismaAuditAction.SESSION_REVOKED;

      /* ================================================= */
      /* Delivery lifecycle                                */
      /* ================================================= */
      case DomainAuditAction.DELIVERY_APPROVED:
        return PrismaAuditAction.DELIVERY_APPROVED;
      case DomainAuditAction.DELIVERY_REJECTED:
        return PrismaAuditAction.DELIVERY_REJECTED;
      case DomainAuditAction.DELIVERY_SUSPENDED:
        return PrismaAuditAction.DELIVERY_SUSPENDED;
      case DomainAuditAction.DELIVERY_BLOCKED:
        return PrismaAuditAction.DELIVERY_BLOCKED;

      /* ================================================= */
      /* Outlet users                                      */
      /* ================================================= */
      case DomainAuditAction.OUTLET_USER_CREATED:
        return PrismaAuditAction.OUTLET_USER_CREATED;
      case DomainAuditAction.OUTLET_USER_DISABLED:
        return PrismaAuditAction.OUTLET_USER_DISABLED;
      case DomainAuditAction.OUTLET_USER_ENABLED:
        return PrismaAuditAction.OUTLET_USER_ENABLED;
      case DomainAuditAction.OUTLET_USER_PASSWORD_RESET:
        return PrismaAuditAction.OUTLET_USER_PASSWORD_RESET;
      case DomainAuditAction.OUTLET_USER_DELETED:
        return PrismaAuditAction.OUTLET_USER_DELETED;

      /* ================================================= */
      /* Outlets (✅ THIS WAS MISSING)                     */
      /* ================================================= */
      case DomainAuditAction.OUTLET_CREATED:
        return PrismaAuditAction.OUTLET_CREATED;
      case DomainAuditAction.OUTLET_UPDATED:
        return PrismaAuditAction.OUTLET_UPDATED;
      case DomainAuditAction.OUTLET_ENABLED:
        return PrismaAuditAction.OUTLET_ENABLED;
      case DomainAuditAction.OUTLET_DISABLED:
        return PrismaAuditAction.OUTLET_DISABLED;
      case DomainAuditAction.OUTLET_OPENED:
        return PrismaAuditAction.OUTLET_OPENED;
      case DomainAuditAction.OUTLET_CLOSED:
        return PrismaAuditAction.OUTLET_CLOSED;
      case DomainAuditAction.OUTLET_TEMPORARILY_CLOSED:
        return PrismaAuditAction.OUTLET_TEMPORARILY_CLOSED;
      case DomainAuditAction.OUTLET_CAMERA_ON:
        return PrismaAuditAction.OUTLET_CAMERA_ON;
      case DomainAuditAction.OUTLET_CAMERA_OFF:
        return PrismaAuditAction.OUTLET_CAMERA_OFF;
      case DomainAuditAction.OUTLET_CAMERA_MAINTENANCE:
        return PrismaAuditAction.OUTLET_CAMERA_MAINTENANCE;

      /* ================================================= */
      /* Super admin                                       */
      /* ================================================= */
      case DomainAuditAction.SUPER_ADMIN_LOGIN:
        return PrismaAuditAction.SUPER_ADMIN_LOGIN;
      case DomainAuditAction.SUPER_ADMIN_ACTION:
        return PrismaAuditAction.SUPER_ADMIN_ACTION;

      default:
        throw new Error(`Unsupported Domain AuditAction: ${action}`);
    }
  }

  static toDomain(action: PrismaAuditAction): DomainAuditAction {
    switch (action) {
      /* OTP */
      case PrismaAuditAction.OTP_REQUESTED:
        return DomainAuditAction.OTP_REQUESTED;
      case PrismaAuditAction.OTP_VERIFICATION_FAILED:
        return DomainAuditAction.OTP_VERIFICATION_FAILED;
      case PrismaAuditAction.OTP_VERIFIED:
        return DomainAuditAction.OTP_VERIFIED;

      /* Authentication */
      case PrismaAuditAction.LOGIN_SUCCESS:
        return DomainAuditAction.LOGIN_SUCCESS;
      case PrismaAuditAction.LOGIN_FAILED:
        return DomainAuditAction.LOGIN_FAILED;
      case PrismaAuditAction.MFA_FAILED:
        return DomainAuditAction.MFA_FAILED;

      /* Tokens */
      case PrismaAuditAction.TOKEN_ISSUED:
        return DomainAuditAction.TOKEN_ISSUED;
      case PrismaAuditAction.TOKEN_REFRESHED:
        return DomainAuditAction.TOKEN_REFRESHED;
      case PrismaAuditAction.TOKEN_REUSE_DETECTED:
        return DomainAuditAction.TOKEN_REUSE_DETECTED;

      /* Sessions */
      case PrismaAuditAction.LOGOUT:
        return DomainAuditAction.LOGOUT;
      case PrismaAuditAction.LOGOUT_ALL:
        return DomainAuditAction.LOGOUT_ALL;
      case PrismaAuditAction.SESSION_REVOKED:
        return DomainAuditAction.SESSION_REVOKED;

      /* Delivery */
      case PrismaAuditAction.DELIVERY_APPROVED:
        return DomainAuditAction.DELIVERY_APPROVED;
      case PrismaAuditAction.DELIVERY_REJECTED:
        return DomainAuditAction.DELIVERY_REJECTED;
      case PrismaAuditAction.DELIVERY_SUSPENDED:
        return DomainAuditAction.DELIVERY_SUSPENDED;
      case PrismaAuditAction.DELIVERY_BLOCKED:
        return DomainAuditAction.DELIVERY_BLOCKED;

      /* Outlet users */
      case PrismaAuditAction.OUTLET_USER_CREATED:
        return DomainAuditAction.OUTLET_USER_CREATED;
      case PrismaAuditAction.OUTLET_USER_DISABLED:
        return DomainAuditAction.OUTLET_USER_DISABLED;
      case PrismaAuditAction.OUTLET_USER_ENABLED:
        return DomainAuditAction.OUTLET_USER_ENABLED;
      case PrismaAuditAction.OUTLET_USER_PASSWORD_RESET:
        return DomainAuditAction.OUTLET_USER_PASSWORD_RESET;
      case PrismaAuditAction.OUTLET_USER_DELETED:
        return DomainAuditAction.OUTLET_USER_DELETED;

      /* Outlets */
      case PrismaAuditAction.OUTLET_CREATED:
        return DomainAuditAction.OUTLET_CREATED;
      case PrismaAuditAction.OUTLET_UPDATED:
        return DomainAuditAction.OUTLET_UPDATED;
      case PrismaAuditAction.OUTLET_ENABLED:
        return DomainAuditAction.OUTLET_ENABLED;
      case PrismaAuditAction.OUTLET_DISABLED:
        return DomainAuditAction.OUTLET_DISABLED;
      case PrismaAuditAction.OUTLET_OPENED:
        return DomainAuditAction.OUTLET_OPENED;
      case PrismaAuditAction.OUTLET_CLOSED:
        return DomainAuditAction.OUTLET_CLOSED;
      case PrismaAuditAction.OUTLET_TEMPORARILY_CLOSED:
        return DomainAuditAction.OUTLET_TEMPORARILY_CLOSED;
      case PrismaAuditAction.OUTLET_CAMERA_ON:
        return DomainAuditAction.OUTLET_CAMERA_ON;
      case PrismaAuditAction.OUTLET_CAMERA_OFF:
        return DomainAuditAction.OUTLET_CAMERA_OFF;
      case PrismaAuditAction.OUTLET_CAMERA_MAINTENANCE:
        return DomainAuditAction.OUTLET_CAMERA_MAINTENANCE;

      /* Super admin */
      case PrismaAuditAction.SUPER_ADMIN_LOGIN:
        return DomainAuditAction.SUPER_ADMIN_LOGIN;
      case PrismaAuditAction.SUPER_ADMIN_ACTION:
        return DomainAuditAction.SUPER_ADMIN_ACTION;

      default:
        throw new Error(`Unsupported Prisma AuditAction: ${action}`);
    }
  }
}
