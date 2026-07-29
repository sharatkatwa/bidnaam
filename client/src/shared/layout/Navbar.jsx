import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice.js";
import Button from "../components/Button.jsx";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4 text-white">
      <Link to="/" className="font-display text-xl">
        BIDARENA
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm">Hi, {user?.name}</span>
            <Link to="/auction/create" className="text-sm hover:underline">
              Create Auction
            </Link>
            <Link to="/profile" className="text-sm hover:underline">
              Profile
            </Link>
            <Button variant="primary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:underline">
              Login
            </Link>
            <Button variant="primary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
