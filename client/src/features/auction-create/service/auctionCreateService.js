import axiosInstance from "../../../api/axiosInstance.js";

export function createAuction(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description ?? "");
  formData.append("startPrice", payload.startPrice);
  formData.append("minimumIncrement", payload.minimumIncrement ?? 1);
  formData.append("startTime", payload.startTime);
  formData.append("endTime", payload.endTime);
  (payload.images ?? []).forEach((file) => formData.append("images", file));

  return axiosInstance
    .post("/auctions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data.data.auction);
}
