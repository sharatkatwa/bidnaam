import axios from "axios";
import { store } from "../app/store.js";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
