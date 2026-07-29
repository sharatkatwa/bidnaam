const variants = {
  primary: "bg-linear-to-r from-bid-orange to-bid-gold text-[#2A1200] hover:brightness-110",
  secondary: "glass text-white hover:bg-white/20",
  outline: "border-2 border-white/40 text-white hover:bg-white/10",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`px-5 py-2 rounded-full font-semibold transition-colors cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
