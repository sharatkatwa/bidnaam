import { Link } from "react-router";
import SplitFlapText from "../components/SplitFlapText.jsx";

export default function Footer() {
  return (
    <footer className="bg-bg-raised border-t border-line mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-urgent pulse-dot-live" />
          <SplitFlapText text="BIDARENA" className="text-xs" />
        </div>

        <div className="flex items-center gap-6 text-sm text-ink-dim">
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

        <p className="text-ink-dim/70 text-xs uppercase tracking-wide">
          Built for the Kodex Mini Hack Sprint · Domain A
        </p>
      </div>
    </footer>
  );
}
