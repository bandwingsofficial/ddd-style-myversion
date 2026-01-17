import customerAxios from "@/http/axios/customerAxios";

customerAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized, just reject
    // Backend decides auth state
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export {};
