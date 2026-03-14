import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://task-manager-tc6x.onrender.com/api/v1",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;