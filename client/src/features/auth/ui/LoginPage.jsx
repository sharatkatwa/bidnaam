import { useState } from "react";
import { useLogin } from "../hooks/useLogin.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={login.isPending}
          className="bg-purple-600 text-white rounded px-3 py-2"
        >
          {login.isPending ? "Logging in..." : "Login"}
        </button>

        {login.isError && (
          <p className="text-red-500 text-sm">Login failed. Try again.</p>
        )}
      </form>
    </div>
  );
}
