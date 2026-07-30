import { useState } from "react";
import { Link } from "react-router";
import { useForgotPassword } from "../hooks/useForgotPassword.js";
import { usePointerTilt } from "../../../shared/hooks/usePointerTilt.js";
import Button from "../../../shared/components/Button.jsx";

const fieldClass =
  "w-full bg-transparent border-0 border-b border-line-paper pb-2.5 text-paper-ink placeholder-paper-ink-dim/50 outline-none focus:border-paper-ink transition";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const resetRequest = useForgotPassword();
  const tilt = usePointerTilt();

  function handleSubmit(e) {
    e.preventDefault();
    resetRequest.mutate(email);
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-10">
      <div className="reveal w-full max-w-sm">
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
              Reset access
            </div>
            <h2 className="font-display font-black text-3xl mb-2">Forgot password?</h2>

            {resetRequest.isSuccess ? (
              <p className="text-paper-ink-dim text-sm leading-relaxed">
                If an account exists for <b className="text-paper-ink">{email}</b>, a
                reset link is on its way.
              </p>
            ) : (
              <>
                <p className="text-paper-ink-dim text-sm mb-8 leading-relaxed">
                  Enter your email and we'll send you a link to get back into the
                  arena.
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

                  <Button
                    type="submit"
                    variant="dark"
                    disabled={resetRequest.isPending}
                    className="w-full mt-1"
                  >
                    {resetRequest.isPending ? "Sending..." : "Send reset link"}
                  </Button>

                  {resetRequest.isError && (
                    <p className="text-urgent text-sm text-center">
                      Couldn't send the link. Try again.
                    </p>
                  )}
                </form>
              </>
            )}

            <p className="text-paper-ink-dim text-sm text-center mt-6">
              <Link
                to="/login"
                className="text-urgent font-semibold hover:underline"
              >
                ← Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
