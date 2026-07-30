import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../service/authService.js";
import { setCredentials } from "../../../shared/store/authSlice.js";

export function useRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data, variables) => {
      const name = variables.name?.trim() || data.user.email.split("@")[0];
      dispatch(setCredentials({ user: { ...data.user, name }, token: data.accessToken }));
      navigate("/");
    },
  });
}
