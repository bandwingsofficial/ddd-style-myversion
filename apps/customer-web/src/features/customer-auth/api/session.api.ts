import axios from "../../../http/axios/customerAxios";

export const fetchSession = () => axios.get("/auth/session/me");

/** Web clients rely on HttpOnly refresh cookie; body is intentionally empty. */
export const refreshSession = () =>
  axios.post("/auth/session/refresh", {}, {
    headers: { "x-client-type": "web" },
  });

export const logoutSession = () => axios.post("/auth/session/logout");
