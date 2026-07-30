import { useState } from "react";
import { Link } from "react-router";
import { useForgotPassword } from "../hooks/useForgotPassword.js";
import Button from "../../../shared/components/Button.jsx";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const resetRequest = useForgotPassword();

  function handleSubmit(e) {
    e.preventDefault();
    resetRequest.mutate(email);
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-10">
      <div className="glass-strong reveal w-full max-w-sm rounded-[22px] p-9">
        <div className="text-xs font-bold uppercase tracking-wide text-bid-cyan mb-2">
          Reset access
        </div>
        <h2 className="text-3xl font-extrabold mb-2">Forgot password?</h2>

        {resetRequest.isSuccess ? (
          <p className="text-white/70 text-sm leading-relaxed">
            If an account exists for <b className="text-white">{email}</b>, a
            reset link is on its way.
          </p>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-7 leading-relaxed">
              Enter your email and we'll send you a link to get back into the
              arena.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bidarena.com"
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={resetRequest.isPending}
                className="w-full mt-1"
              >
                {resetRequest.isPending ? "Sending..." : "Send reset link"}
              </Button>

              {resetRequest.isError && (
                <p className="text-red-300 text-sm text-center">
                  Couldn't send the link. Try again.
                </p>
              )}
            </form>
          </>
        )}

        <p className="text-white/70 text-sm text-center mt-6">
          <Link
            to="/login"
            className="text-bid-gold font-semibold hover:underline"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
