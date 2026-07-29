import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { registerUser } from "../service/authService.js";
import { setCredentials } from "../../../shared/store/authSlice.js";

export function useRegister() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }));
    },
  });
}
