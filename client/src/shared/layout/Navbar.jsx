import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice.js";
import Button from "../components/Button.jsx";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    setMenuOpen(false);
    navigate("/");
  }

  function go(path) {
    setMenuOpen(false);
    navigate(path);
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className="glass sticky top-0 z-50 text-white border-b border-white/10 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <span className="w-2 h-2 rounded-full bg-live-red pulse-dot-live" />
          <span className="font-display text-xl shine-text">BIDARENA</span>
        </Link>

        <button
          type="button"
          className="md:hidden text-2xl leading-none w-9 h-9 flex items-center justify-center"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 glass rounded-full pl-1.5 pr-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-bid-gold to-bid-orange flex items-center justify-center text-[11px] font-bold text-[#2A1200]">
                  {initial}
                </div>
                <span className="text-sm">{user?.name}</span>
              </div>
              <Link to="/dashboard" className="link-underline text-sm">
                Dashboard
              </Link>
              <Link to="/auction/create" className="link-underline text-sm">
                Create Auction
              </Link>
              <Link to="/profile" className="link-underline text-sm">
                Profile
              </Link>
              <Button variant="primary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="primary" className="btn-glow-pulse" onClick={() => navigate("/register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-6 pb-5">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 glass rounded-full pl-1.5 pr-3 py-1.5 w-fit">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-bid-gold to-bid-orange flex items-center justify-center text-[11px] font-bold text-[#2A1200]">
                  {initial}
                </div>
                <span className="text-sm">{user?.name}</span>
              </div>
              <Link to="/dashboard" className="text-sm" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/auction/create" className="text-sm" onClick={() => setMenuOpen(false)}>
                Create Auction
              </Link>
              <Link to="/profile" className="text-sm" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Button variant="primary" onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => go("/login")} className="w-full">
                Login
              </Button>
              <Button variant="primary" onClick={() => go("/register")} className="w-full">
                Register
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
