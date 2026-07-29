import axiosInstance from "../../../api/axiosInstance.js";

export function getProfileStats() {
  return axiosInstance.get("/profile").then((res) => res.data);
}
