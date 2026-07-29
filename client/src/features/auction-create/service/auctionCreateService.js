import axiosInstance from "../../../api/axiosInstance.js";

export function createAuction(payload) {
  return axiosInstance.post("/auctions", payload).then((res) => res.data);
}
