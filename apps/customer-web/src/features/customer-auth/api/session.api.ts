import axios from "../../../http/axios/customerAxios";

export const fetchSession = () =>
  axios.get("/auth/session/me");

export const refreshSession = (refreshToken: string) =>
  axios.post("/auth/session/refresh", { refreshToken });

export const logoutSession = () =>
  axios.post("/auth/session/logout");
