// src/modules/outlets/mappers/outlet-working-state.mapper.ts

import { OutletWorkingState } from '../domain/value-objects/outlet-working-state.vo';
import { OutletWorkingStatus } from '../domain/enums/outlet-working-status.enum';

export class OutletWorkingStateMapper {
  static toDomain(status: OutletWorkingStatus): OutletWorkingState {
    switch (status) {
      case OutletWorkingStatus.OPEN:
        return OutletWorkingState.open();

      case OutletWorkingStatus.CLOSED:
        return OutletWorkingState.close();

      case OutletWorkingStatus.TEMPORARILY_CLOSED:
        return OutletWorkingState.temporarilyClosed();

      default:
        throw new Error(
          `Unknown OutletWorkingStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    state: OutletWorkingState,
  ): OutletWorkingStatus {
    return state.getRaw();
  }
}
