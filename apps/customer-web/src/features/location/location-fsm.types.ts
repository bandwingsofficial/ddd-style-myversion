export type LocationFsmState =
  | "IDLE"
  | "LOADING_LOCATION"
  | "FINDING_OUTLETS"
  | "OUTLET_FOUND"
  | "NO_OUTLET"
  | "READY"
  | "ERROR"
  | "CANCELLED";

export const TERMINAL_FSM_STATES: LocationFsmState[] = [
  "NO_OUTLET",
  "READY",
  "ERROR",
  "CANCELLED",
];

export function isTerminalState(state: LocationFsmState): boolean {
  return TERMINAL_FSM_STATES.includes(state);
}

export function shouldShowContentShimmer(state: LocationFsmState): boolean {
  return (
    state === "IDLE" ||
    state === "LOADING_LOCATION" ||
    state === "FINDING_OUTLETS" ||
    state === "OUTLET_FOUND"
  );
}
