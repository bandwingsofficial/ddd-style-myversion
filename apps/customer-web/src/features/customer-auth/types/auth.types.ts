export interface OtpRequestResponse {
  success: boolean;
  code: "OTP_SENT";
  message: string;
  data: {
    cooldownSeconds: number;
    remainingResends: number;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  code: "LOGIN_SUCCESS";
  message: string;
  data: {
    actorType: "CUSTOMER";
    actorId: string;
    sessionId: string;
    roles: string[];
  };
}

export interface SessionContext {
  actorType: "CUSTOMER";
  actorId: string;
  sessionId: string;
}
