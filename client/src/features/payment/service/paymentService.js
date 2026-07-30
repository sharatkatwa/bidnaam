import axiosInstance from "../../../api/axiosInstance.js";

export function createOrder(auctionId) {
  return axiosInstance
    .post(`/payments/create-order/${auctionId}`)
    .then((res) => res.data.data);
}

export function verifyPayment(payload) {
  return axiosInstance.post("/payments/verify", payload).then((res) => res.data.data);
}
