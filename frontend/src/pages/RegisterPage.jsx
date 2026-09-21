import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { setProfileId } from "../utils/storage";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "SUPPLIER" ? "SUPPLIER" : "CLIENT";
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [clientForm, setClientForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const [supplierForm, setSupplierForm] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessLocation: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (role === "CLIENT") {
        const res = await api.createClient({
          ...clientForm,
          phone: clientForm.phone || undefined,
        });
        const id = res.data?.id;
        if (id) {
          setProfileId("CLIENT", clientForm.email, id);
          setSuccessId(id);
        }
      } else {
        const res = await api.createSupplier({
          ...supplierForm,
          phone: supplierForm.phone || undefined,
        });
        const id = res.data?.id;
        if (id) {
          setProfileId("SUPPLIER", supplierForm.email, id);
          setSuccessId(id);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="page-panel stack-lg" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="page-header">
          <h1>You're registered</h1>
          <p>Your profile ID is saved on this browser. Sign in with OTP to continue.</p>
        </div>
        <div className="card stack">
          <div className="alert alert--success">
            Profile ID: <code>{successId}</code>
          </div>
          <Link to={`/login?role=${role}`} className="btn btn--primary">
            Continue to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel stack-lg" style={{ maxWidth: 540, margin: "0 auto" }}>
      <div className="page-header">
        <h1>Create account</h1>
        <p>Register your organization, then sign in with a one-time email code.</p>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${role === "CLIENT" ? "tab--active" : ""}`}
          onClick={() => setRole("CLIENT")}
        >
          Client
        </button>
        <button
          type="button"
          className={`tab ${role === "SUPPLIER" ? "tab--active" : ""}`}
          onClick={() => setRole("SUPPLIER")}
        >
          Supplier
        </button>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}

        {role === "CLIENT" ? (
          <>
            <div className="field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                required
                value={clientForm.companyName}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, companyName: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="contactPerson">Contact person</label>
              <input
                id="contactPerson"
                required
                value={clientForm.contactPerson}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, contactPerson: e.target.value }))
                }
              />
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="clientEmail">Email</label>
                <input
                  id="clientEmail"
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) =>
                    setClientForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="clientPhone">Phone (optional)</label>
                <input
                  id="clientPhone"
                  value={clientForm.phone}
                  onChange={(e) =>
                    setClientForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="supplierName">Supplier / business name</label>
              <input
                id="supplierName"
                required
                value={supplierForm.supplierName}
                onChange={(e) =>
                  setSupplierForm((f) => ({ ...f, supplierName: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="supplierContact">Contact person</label>
              <input
                id="supplierContact"
                required
                value={supplierForm.contactPerson}
                onChange={(e) =>
                  setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))
                }
              />
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="supplierEmail">Email</label>
                <input
                  id="supplierEmail"
                  type="email"
                  required
                  value={supplierForm.email}
                  onChange={(e) =>
                    setSupplierForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="supplierPhone">Phone (optional)</label>
                <input
                  id="supplierPhone"
                  value={supplierForm.phone}
                  onChange={(e) =>
                    setSupplierForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="businessLocation">Business location</label>
              <input
                id="businessLocation"
                required
                value={supplierForm.businessLocation}
                onChange={(e) =>
                  setSupplierForm((f) => ({
                    ...f,
                    businessLocation: e.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="card__meta" style={{ textAlign: "center" }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
