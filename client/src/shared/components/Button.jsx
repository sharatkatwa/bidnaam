import { forwardRef } from "react";

const variants = {
  primary: "bg-brand text-[#1A0F04] hover:bg-[#f0a256]",
  dark: "bg-[#18140d] text-paper hover:bg-[#241d13]",
  outline: "border border-line-strong text-ink hover:bg-white/5 hover:border-ink-dim",
  ghost: "text-ink-dim hover:text-ink hover:bg-white/5",
};

const Button = forwardRef(function Button(
  { children, variant = "primary", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`relative px-5 py-2.5 rounded-md font-semibold transition-all duration-150 cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
