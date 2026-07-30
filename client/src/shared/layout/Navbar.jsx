import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice.js";
import Button from "../components/Button.jsx";
import SplitFlapText from "../components/SplitFlapText.jsx";

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
    <nav className="bg-bg-raised sticky top-0 z-50 text-ink border-b border-line">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <span className="w-2 h-2 rounded-full bg-urgent pulse-dot-live" />
          <SplitFlapText text="BIDARENA" className="text-sm" />
        </Link>

        <button
          type="button"
          className="md:hidden text-2xl leading-none w-9 h-9 flex items-center justify-center"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="hidden md:flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 border border-line rounded-full pl-1.5 pr-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[11px] font-bold text-[#1A0F04]">
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
              <Link to="/watchlist" className="link-underline text-sm">
                Watchlist
              </Link>
              <Link to="/profile" className="link-underline text-sm">
                Profile
              </Link>
              <Button variant="dark" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="primary" onClick={() => navigate("/register")}>
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
              <div className="flex items-center gap-2 border border-line rounded-full pl-1.5 pr-3 py-1.5 w-fit">
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[11px] font-bold text-[#1A0F04]">
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
              <Button variant="dark" onClick={handleLogout} className="w-full">
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
