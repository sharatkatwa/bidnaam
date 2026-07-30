import axiosInstance from "../../../api/axiosInstance.js";

export function loginUser({ email, password }) {
  return axiosInstance
    .post("/auth/login", { email, password })
    .then((res) => res.data.data);
}

export function registerUser({ email, password }) {
  return axiosInstance
    .post("/auth/register", { email, password })
    .then((res) => res.data.data);
}

export function requestPasswordReset(email) {
  return axiosInstance
    .post("/auth/forgot-password", { email })
    .then((res) => res.data);
}
