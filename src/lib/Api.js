import axios from "axios";

const sanitizeApiUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "";
  }
  const normalized = raw.replace(
    /^https?:\/\/stylexpress3\.scmcloud\.online(?=\/|$)/i,
    "https://stylexpress3api.scmcloud.online"
  );
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return "";
  }
  return normalized.replace(/\/+$/, "").replace(/\/api$/i, "");
};

const API_BASE = sanitizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
const REFRESH_URL = API_BASE ? `${API_BASE}/api/auth/refresh` : "/api/auth/refresh";

export const api = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (original.url?.includes("/api/auth/")) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!accessToken || !refreshToken) throw new Error("No tokens");

      const { data } = await axios.post(
        REFRESH_URL,
        { accessToken, refreshToken },
        { withCredentials: true }
      );
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;

      refreshQueue.forEach((q) => q.resolve(data.accessToken));
      refreshQueue = [];

      return api(original);
    } catch {
      refreshQueue.forEach((q) => q.reject(error));
      refreshQueue = [];
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);
