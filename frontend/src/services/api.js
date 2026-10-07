import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("iq_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.error?.code;
    if (status === 401 && (code === "token_expired" || code === "invalid_token" || code === "unauthorized")) {
      localStorage.removeItem("iq_access_token");
      localStorage.removeItem("iq_refresh_token");
      localStorage.removeItem("iq_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.error?.message || fallback;
}
