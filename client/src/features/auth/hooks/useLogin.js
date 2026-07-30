import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../service/authService.js";
import { setCredentials } from "../../../shared/store/authSlice.js";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const name = data.user.email.split("@")[0];
      dispatch(setCredentials({ user: { ...data.user, name }, token: data.accessToken }));
      navigate("/");
    },
  });
}
