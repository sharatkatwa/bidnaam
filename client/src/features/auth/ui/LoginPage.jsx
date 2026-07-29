import { useState } from "react";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin.js";
import Button from "../../../shared/components/Button.jsx";
import LiveAuctionHero from "../../../shared/components/LiveAuctionHero.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="min-h-[calc(100vh-73px)] grid lg:grid-cols-[1.4fr_1fr] gap-6 px-6 py-10 lg:px-10">
      <LiveAuctionHero />

      <div className="flex items-center justify-center">
        <div className="glass-strong reveal w-full max-w-sm rounded-[22px] p-9" style={{ animationDelay: "0.15s" }}>
          <div className="text-xs font-bold uppercase tracking-wide text-bid-cyan mb-2">Welcome back</div>
          <h2 className="text-3xl font-extrabold mb-2">Login to bid</h2>
          <p className="text-white/70 text-sm mb-7 leading-relaxed">
            Browsing stays open to everyone — sign in to place a bid, list a lot, or join the room chat.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bidarena.com"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={login.isPending} className="w-full mt-1">
              {login.isPending ? "Logging in..." : "Enter the arena →"}
            </Button>

            {login.isError && <p className="text-red-300 text-sm text-center">Login failed. Try again.</p>}
          </form>

          <p className="text-white/70 text-sm text-center mt-6">
            New here?{" "}
            <Link to="/register" className="text-bid-gold font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
