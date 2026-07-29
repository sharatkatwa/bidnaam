import { useState } from "react";
import { useRegister } from "../hooks/useRegister.js";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  function handleSubmit(e) {
    e.preventDefault();
    register.mutate({ name, email, password });
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

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
          disabled={register.isPending}
          className="bg-purple-600 text-white rounded px-3 py-2"
        >
          {register.isPending ? "Creating account..." : "Register"}
        </button>

        {register.isError && (
          <p className="text-red-500 text-sm">Registration failed. Try again.</p>
        )}
      </form>
    </div>
  );
}
