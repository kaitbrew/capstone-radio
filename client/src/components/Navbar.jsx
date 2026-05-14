import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-brand">
          📻 KB Radio
        </Link>

        {user ? (
          <>
            <Link to="/favorites" className="navbar-link">
              Favorites
            </Link>
            <span className="navbar-username">👤 {user.username}</span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-link navbar-login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
