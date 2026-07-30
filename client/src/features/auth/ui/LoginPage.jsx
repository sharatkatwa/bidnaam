import { useState } from "react";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin.js";
import { usePointerTilt } from "../../../shared/hooks/usePointerTilt.js";
import Button from "../../../shared/components/Button.jsx";
import PasswordInput from "../../../shared/components/PasswordInput.jsx";
import LiveAuctionHero from "../../../shared/components/LiveAuctionHero.jsx";

const fieldClass =
  "w-full bg-transparent border-0 border-b border-line-paper pb-2.5 text-paper-ink placeholder-paper-ink-dim/50 outline-none focus:border-paper-ink transition";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const tilt = usePointerTilt();

  function handleSubmit(e) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="min-h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 px-6 py-10 lg:px-10">
      <LiveAuctionHero />

      <div className="flex items-center justify-center">
        <div className="reveal w-full max-w-sm" style={{ animationDelay: "0.15s" }}>
        <div className="relative" style={{ perspective: "1400px" }}>
        <div className="paper absolute inset-0 rounded-3xl translate-x-2.5 translate-y-3 -rotate-2 opacity-50" aria-hidden="true" />
        <div
          ref={tilt.ref}
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
          style={tilt.style}
          className="paper paper-tape relative rounded-3xl p-9 transition-transform duration-200 ease-out"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-urgent mb-3">
            Boarding now
          </div>
          <h2 className="font-display font-black text-3xl mb-2">Login to bid</h2>
          <p className="text-paper-ink-dim text-sm mb-8 leading-relaxed">
            Browsing stays open to everyone — sign in to place a bid, list a
            lot, or join the room chat.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-paper-ink-dim mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bidarena.com"
                className={fieldClass}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-paper-ink-dim">Password</label>
                <Link to="/forgot-password" className="text-xs text-urgent font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
                required
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-paper-ink-dim uppercase tracking-wide">
              <input type="checkbox" className="accent-paper-ink" />
              Keep me signed in
            </label>

            <Button
              type="submit"
              variant="dark"
              disabled={login.isPending}
              className="w-full mt-1"
            >
              {login.isPending ? "Logging in..." : "Enter the arena →"}
            </Button>

            {login.isError && (
              <p className="text-urgent text-sm text-center">
                {login.error?.response?.data?.message || "Login failed. Try again."}
              </p>
            )}
          </form>

          <div className="flex items-center gap-3 my-6 text-[11px] text-paper-ink-dim/60 uppercase tracking-widest">
            <span className="flex-1 h-px bg-line-paper" />
            Or
            <span className="flex-1 h-px bg-line-paper" />
          </div>

          <p className="text-paper-ink-dim text-sm text-center">
            New here?{" "}
            <Link
              to="/register"
              className="text-urgent font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
