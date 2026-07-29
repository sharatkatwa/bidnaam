import axiosInstance from "../../../api/axiosInstance.js";

export function getAuctions() {
  return axiosInstance.get("/auctions").then((res) => res.data);
}
