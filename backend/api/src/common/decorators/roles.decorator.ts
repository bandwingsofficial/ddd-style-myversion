import { SetMetadata } from '@nestjs/common';
import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: ActorType[]) =>
  SetMetadata(ROLES_KEY, roles);
