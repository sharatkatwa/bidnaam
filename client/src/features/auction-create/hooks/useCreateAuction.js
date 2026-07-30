import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createAuction } from "../service/auctionCreateService.js";

export function useCreateAuction() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createAuction,
    onSuccess: (auction) => navigate(`/auction/${auction._id}`),
  });
}
