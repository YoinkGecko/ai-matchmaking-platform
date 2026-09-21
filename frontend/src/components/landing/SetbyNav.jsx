import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPathForRole } from "../../utils/routes";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#platform", label: "Platform" },
  { href: "#mission", label: "Mission" },
  { href: "#stats", label: "Results" },
];

export default function SetbyNav({ inverted = false }) {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shellClass = [
    "setby-nav",
    scrolled ? "setby-nav--scrolled" : "",
    inverted ? "setby-nav--inverted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={shellClass}>
      <div className="setby-nav__inner">
        <Link to="/" className="setby-logo" onClick={() => setMenuOpen(false)}>
          <span className="setby-logo__mark" aria-hidden="true" />
          <span>Wisdom Match</span>
        </Link>

        <button
          type="button"
          className="setby-nav__burger"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <nav className={`setby-nav__links ${menuOpen ? "setby-nav__links--open" : ""}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="setby-nav__actions">
          {isAuthenticated ? (
            <Link to={dashboardPathForRole(user.role)} className="setby-btn setby-btn--dark">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="setby-nav__login">Log in</Link>
              <Link to="/register" className="setby-btn setby-btn--dark">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
