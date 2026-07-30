import axiosInstance from "../../../api/axiosInstance.js";

export function loginUser(credentials) {
  return axiosInstance.post("/auth/login", credentials).then((res) => res.data);
}

export function registerUser(userData) {
  return axiosInstance.post("/auth/register", userData).then((res) => res.data);
}

export function requestPasswordReset(email) {
  return axiosInstance
    .post("/auth/forgot-password", { email })
    .then((res) => res.data);
}
