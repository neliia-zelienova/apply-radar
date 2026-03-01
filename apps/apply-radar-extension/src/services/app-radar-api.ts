import axios, { isCancel, type InternalAxiosRequestConfig } from "axios";
import {
  getExtensionStorage,
  setExtensionStorage,
} from "../utils/extensionStorage";
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  // Required so the API can set/send the HttpOnly refresh cookie.
  withCredentials: true,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  // CSRF hardening for refresh: a browser can't add this header via plain form submits.
  // The API expects this for /auth/refresh.
  (config.headers as any)["x-ar-ext"] = "1";

  const jwt = await getExtensionStorage<string>("jwt");
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) throw error;

    const status = error?.response?.status;
    const isAuthRoute =
      typeof originalRequest.url === "string" &&
      originalRequest.url.startsWith("/auth/");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      refreshPromise =
        refreshPromise ??
        (async () => {
          const response = await api.post(`/auth/refresh`);
          const newJwt = response.data?.access_token as string | undefined;
          if (!newJwt)
            throw new Error("Refresh succeeded but no access_token returned");
          await setExtensionStorage("jwt", newJwt);
          return newJwt;
        })().finally(() => {
          refreshPromise = null;
        });

      const newJwt = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newJwt}`;

      return api.request(originalRequest);
    }

    throw error;
  },
);

export class ApplyRadarApi {
  static async googleSignIn(token: string) {
    try {
      const response = await api.post(`/auth/google`, {
        idToken: token,
      });
      return response.data;
    } catch (error) {
      if (isCancel(error)) {
        console.log("Request cancelled:", error.message);
      } else if (axios.isAxiosError(error)) {
        console.error(
          "Axios error:",
          (error.response?.data as any) ?? error.message,
        );
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  // Expose the axios instance for other API calls you add later.
  static client = api;
}
