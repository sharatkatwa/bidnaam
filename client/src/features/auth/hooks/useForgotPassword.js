import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../service/authService.js";

export function useForgotPassword() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}
