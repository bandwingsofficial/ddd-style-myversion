import { ForbiddenError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { DeliveryStatus } from '../domain/enums/delivery-status.enum';
import { DeliveryPartner } from '../domain/models/delivery-partner.model';

export class DeliveryApprovedPolicy {
  static check(partner: DeliveryPartner): void {
    if (partner.status !== DeliveryStatus.APPROVED) {
      throw new ForbiddenError(
        AuthErrors.ACCOUNT_INACTIVE,
        'Delivery partner is not approved',
        {
          status: partner.status,
        },
      );
    }
  }
}
