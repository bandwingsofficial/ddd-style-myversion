import axios from "../../../http/axios/customerAxios";

export const requestOtp = (phone: string) =>
  axios.post("/auth/customer/otp/request", { phone });

export const verifyOtp = (phone: string, otp: string) =>
  axios.post("/auth/customer/otp/verify", { phone, otp });
