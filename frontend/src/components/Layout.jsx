import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/routes";

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLanding) {
    return <>{children}</>;
  }

  const dashboardPath = user ? dashboardPathForRole(user.role) : "/client";

  return (
    <div className="app-shell app-shell--product">
      <header className="app-header app-header--product">
        <div className="app-header__inner">
          <Link to="/" className="setby-logo setby-logo--compact">
            <span className="setby-logo__mark" aria-hidden="true" />
            <span>Wisdom Match</span>
          </Link>
          <nav className="btn-row">
            {isAuthenticated ? (
              <>
                <span className="header-meta">
                  {user.email} · {user.role}
                </span>
                <Link
                  to={user.role === "CLIENT" ? "/client/settings" : user.role === "SUPPLIER" ? "/supplier/settings" : dashboardPath}
                  className="setby-btn setby-btn--outline setby-btn--sm"
                >
                  Settings
                </Link>
                <Link to={dashboardPath} className="setby-btn setby-btn--dark setby-btn--sm">
                  Dashboard
                </Link>
                <button type="button" className="setby-btn setby-btn--ghost setby-btn--sm" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="setby-btn setby-btn--ghost setby-btn--sm">Home</Link>
                <Link to="/login" className="setby-btn setby-btn--outline setby-btn--sm">Log in</Link>
                <Link to="/register" className="setby-btn setby-btn--orange setby-btn--sm">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main app-main--product">{children}</main>
    </div>
  );
}
