import { useState } from "react";
import { Link } from "react-router";
import { useRegister } from "../hooks/useRegister.js";
import Button from "../../../shared/components/Button.jsx";
import LiveAuctionHero from "../../../shared/components/LiveAuctionHero.jsx";

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
    <div className="min-h-[calc(100vh-73px)] grid lg:grid-cols-[1.4fr_1fr] gap-6 px-6 py-10 lg:px-10">
      <LiveAuctionHero />

      <div className="flex items-center justify-center">
        <div className="glass-strong reveal w-full max-w-sm rounded-[22px] p-9" style={{ animationDelay: "0.15s" }}>
          <div className="text-xs font-bold uppercase tracking-wide text-bid-cyan mb-2">Join the arena</div>
          <h2 className="text-3xl font-extrabold mb-2">Create account</h2>
          <p className="text-white/70 text-sm mb-7 leading-relaxed">
            Sign up to bid, list your own auctions, and chat with other bidders in real time.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
                required
              />
            </div>

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

            <Button type="submit" variant="primary" disabled={register.isPending} className="w-full mt-1">
              {register.isPending ? "Creating account..." : "Enter the arena →"}
            </Button>

            {register.isError && <p className="text-red-300 text-sm text-center">Registration failed. Try again.</p>}
          </form>

          <p className="text-white/70 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-bid-gold font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
