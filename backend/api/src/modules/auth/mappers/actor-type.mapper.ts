// src/modules/auth/repositories/mappers/actor-type.mapper.ts

import { ActorType as PrismaActorType } from '@prisma/client';
import { ActorType } from '../domain/enums/actor-type.enum';

export class ActorTypeMapper {
  static toDomain(type: PrismaActorType): ActorType {
    switch (type) {
      case PrismaActorType.CUSTOMER:
        return ActorType.CUSTOMER;

      case PrismaActorType.DELIVERY:
        return ActorType.DELIVERY;

      case PrismaActorType.OUTLET_USER:
        return ActorType.OUTLET_USER;

      case PrismaActorType.SUPER_ADMIN:
        return ActorType.SUPER_ADMIN;

      default:
        throw new Error(`Unknown Prisma ActorType: ${type}`);
    }
  }

  static toPrisma(type: ActorType): PrismaActorType {
    switch (type) {
      case ActorType.CUSTOMER:
        return PrismaActorType.CUSTOMER;

      case ActorType.DELIVERY:
        return PrismaActorType.DELIVERY;

      case ActorType.OUTLET_USER:
        return PrismaActorType.OUTLET_USER;

      case ActorType.SUPER_ADMIN:
        return PrismaActorType.SUPER_ADMIN;

      default:
        throw new Error(`Unknown Domain ActorType: ${type}`);
    }
  }
}
