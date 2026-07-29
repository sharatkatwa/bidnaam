import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginUser } from "../service/authService.js";
import { setCredentials } from "../../../shared/store/authSlice.js";

export function useLogin() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }));
    },
  });
}
