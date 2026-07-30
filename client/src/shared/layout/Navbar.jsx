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

  return (
    <nav className="glass sticky top-0 z-50 text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl" onClick={() => setMenuOpen(false)}>
          BIDARENA
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
              <span className="text-sm">Hi, {user?.name}</span>
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
              <span className="text-sm text-white/70">Hi, {user?.name}</span>
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
