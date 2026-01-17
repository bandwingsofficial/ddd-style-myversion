import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Access token
export const getAccessToken = (): string | undefined => {
  const token = Cookies.get(ACCESS_TOKEN_KEY);
  return token === "undefined" ? undefined : token;
};

// Set tokens (only block undefined, nothing else)
export const setTokens = (
  accessToken: string,
  refreshToken: string
) => {
  if (accessToken !== "undefined") {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  if (refreshToken !== "undefined") {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
};

// Clear tokens
export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
