interface ApiErrorPayload {
  response?: {
    data?: { code?: string; message?: string };
  };
  message?: string;
}

export function mapAddressApiError(error: unknown, fallback: string): string {
  const err = error as ApiErrorPayload;
  const code = err.response?.data?.code;
  const message = err.response?.data?.message ?? err.message;

  switch (code) {
    case "SAVED_ADDRESS_TYPE_ALREADY_EXISTS":
      return "You already have an address of this type. Edit the existing one or choose a different label.";
    case "SAVED_ADDRESS_NOT_FOUND":
      return "This address could not be found. Please refresh and try again.";
    case "ADDRESS_OUT_OF_SERVICE":
      return "Sorry, we don't currently deliver to this address.";
    case "ADDRESS_OUTLET_MISMATCH":
      return message ?? "This address is outside the delivery area of your selected outlet.";
    case "SESSION_NOT_READY":
      return "Your session is still loading. Please wait a moment and try again.";
    default:
      if (message && !message.toLowerCase().includes("internal")) {
        return message;
      }
      return fallback;
  }
}
