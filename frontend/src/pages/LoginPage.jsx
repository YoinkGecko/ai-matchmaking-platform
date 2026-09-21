import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/routes";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole =
    roleParam === "ADMIN"
      ? "ADMIN"
      : roleParam === "SUPPLIER"
        ? "SUPPLIER"
        : "CLIENT";
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { login, saveProfileId } = useAuth();
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.requestOtp(email, role);
      setInfo("OTP sent to your email. It expires in 5 minutes.");
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.verifyOtp(email, otp, role);
      login(result.token, result.user);
      if (role === "CLIENT") {
        try {
          const profile = await api.getMyClientProfile();
          const id = profile.data?.id;
          if (id) saveProfileId(id);
        } catch {
          /* profile banner can link manually */
        }
      } else if (role === "SUPPLIER") {
        try {
          const profile = await api.getMySupplierProfile();
          const id = profile.data?.id;
          if (id) saveProfileId(id);
        } catch {
          /* profile banner can link manually */
        }
      }
      navigate(dashboardPathForRole(role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel stack-lg auth-page" style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="page-header">
        <h1>Log in</h1>
        <p>
          {role === "ADMIN"
            ? "Admin access uses OTP sent to your authorized email."
            : "One-time code sent to your registered email."}
        </p>
      </div>

      <div className="card stack">
        <div className="field">
          <label htmlFor="role">I am a</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={step === "otp"}
          >
            <option value="CLIENT">Client (buyer)</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="ADMIN">Admin (superuser)</option>
          </select>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {info && <div className="alert alert--success">{info}</div>}

        {step === "email" ? (
          <form className="stack" onSubmit={requestOtp}>
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <button type="submit" className="setby-btn setby-btn--orange setby-btn--wide" disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="stack" onSubmit={verifyOtp}>
            <div className="field">
              <label htmlFor="otp">One-time password</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>
            <button type="submit" className="setby-btn setby-btn--orange setby-btn--wide" disabled={loading}>
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              className="setby-btn setby-btn--ghost"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>

      {role !== "ADMIN" && (
        <p className="card__meta" style={{ textAlign: "center" }}>
          New here? <Link to="/register" className="setby-link">Sign up</Link>
        </p>
      )}
    </div>
  );
}
