import { forwardRef } from "react";

const variants = {
  primary: "bg-linear-to-r from-bid-orange to-bid-gold text-[#2A1200] hover:brightness-110 shadow-[0_6px_20px_-6px_rgba(255,140,60,0.55)] hover:shadow-[0_10px_28px_-6px_rgba(255,140,60,0.75)]",
  secondary: "glass text-white hover:bg-white/20",
  outline: "border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/70",
};

const Button = forwardRef(function Button(
  { children, variant = "primary", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`btn-shine relative overflow-hidden px-5 py-2 rounded-full font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
