import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-live-red pulse-dot-live" />
          <span className="font-display text-lg shine-text">BIDARENA</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link to="/" className="link-underline">
            Discover
          </Link>
          <Link to="/auction/create" className="link-underline">
            Sell
          </Link>
          <Link to="/dashboard" className="link-underline">
            Dashboard
          </Link>
        </div>

        <p className="text-white/40 text-xs">
          Built for the Kodex Mini Hack Sprint · Domain A — Marketplace & UX
        </p>
      </div>
    </footer>
  );
}
