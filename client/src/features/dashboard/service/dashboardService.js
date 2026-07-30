import axiosInstance from "../../../api/axiosInstance.js";

export function getDashboardStats() {
  return axiosInstance.get("/dashboard").then((res) => res.data);
}
