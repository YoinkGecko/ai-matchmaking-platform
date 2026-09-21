import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import FadeIn from "../components/FadeIn";
import ProfileLinkBanner from "../components/ProfileLinkBanner";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, pick, titleCase } from "../utils/format";

const emptyRequirement = {
  productRequirement: "",
  category: "",
  quantityRequired: "",
  unit: "units",
  specifications: "",
  qualityGrade: "",
  additionalNotes: "",
  budget: "",
  currency: "INR",
  budgetType: "TOTAL",
  deliveryLocation: "",
  requiredByDate: "",
  allowMultipleSuppliers: false,
};

export default function ClientDashboard() {
  const { profileId } = useAuth();
  const [client, setClient] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRequirement);
  const [submitting, setSubmitting] = useState(false);

  const loadRequirements = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [clientRes, reqRes] = await Promise.all([
        api.getClient(profileId),
        api.getRequirements(profileId),
      ]);
      setClient(clientRes.data);
      setRequirements(reqRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createRequirement(profileId, {
        ...form,
        quantityRequired: Number(form.quantityRequired),
        budget: Number(form.budget),
        specifications: form.specifications || undefined,
        qualityGrade: form.qualityGrade || undefined,
        additionalNotes: form.additionalNotes || undefined,
      });
      setForm(emptyRequirement);
      setShowForm(false);
      await loadRequirements();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const companyName =
    pick(client, "companyName", "company_name") || "Your company";

  return (
    <div className="page-panel stack-lg">
      <FadeIn>
        <div className="page-header page-header--row">
          <div>
            <h1>Client dashboard</h1>
            <p>Submit requirements, track status, and run AI matching.</p>
          </div>
          {profileId && (
            <div className="btn-row">
              <Link to="/client/settings" className="btn btn--secondary">
                Settings
              </Link>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? "Cancel" : "New requirement"}
              </button>
            </div>
          )}
        </div>
      </FadeIn>

      {profileId && client && (
        <div className="org-banner fade-in">
          <div>
            <strong>{companyName}</strong>
            <p className="card__meta">
              {pick(client, "contactPerson", "contact_person")} ·{" "}
              {pick(client, "email", "email")}
            </p>
          </div>
        </div>
      )}

      <ProfileLinkBanner label="client" />

      {error && <div className="alert alert--error">{error}</div>}

      <div className="dashboard-grid">
        <aside className="stack">
          <p className="section-title">Overview</p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{requirements.length}</div>
              <div className="stat-card__label">Requirements</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">
                {requirements.filter((r) => pick(r, "status", "status") === "OPEN").length}
              </div>
              <div className="stat-card__label">Open</div>
            </div>
          </div>
        </aside>

        <div className="stack">
          {showForm && profileId && (
            <form className="card stack fade-in" onSubmit={handleCreate}>
              <h2>Submit requirement</h2>
              <div className="field">
                <label htmlFor="companyDisplay">Company / client name</label>
                <input id="companyDisplay" value={companyName} readOnly disabled />
                <span className="field-hint">Linked to your registered profile</span>
              </div>
              <div className="field">
                <label htmlFor="productRequirement">Product requirement</label>
                <textarea
                  id="productRequirement"
                  required
                  value={form.productRequirement}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, productRequirement: e.target.value }))
                  }
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="deliveryLocation">Location (delivery)</label>
                  <input
                    id="deliveryLocation"
                    required
                    value={form.deliveryLocation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deliveryLocation: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="quantityRequired">Quantity required</label>
                  <input
                    id="quantityRequired"
                    type="number"
                    min="1"
                    required
                    value={form.quantityRequired}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantityRequired: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="unit">Unit</label>
                  <input
                    id="unit"
                    required
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="budget">Budget</label>
                  <input
                    id="budget"
                    type="number"
                    min="0"
                    required
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="budgetType">Budget type</label>
                  <select
                    id="budgetType"
                    value={form.budgetType}
                    onChange={(e) => setForm((f) => ({ ...f, budgetType: e.target.value }))}
                  >
                    <option value="TOTAL">Total</option>
                    <option value="PER_UNIT">Per unit</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="requiredByDate">Delivery timeline (required by)</label>
                  <input
                    id="requiredByDate"
                    type="date"
                    required
                    value={form.requiredByDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requiredByDate: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="allowMultiple">Fulfillment</label>
                  <select
                    id="allowMultiple"
                    value={form.allowMultipleSuppliers ? "yes" : "no"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        allowMultipleSuppliers: e.target.value === "yes",
                      }))
                    }
                  >
                    <option value="no">Single supplier</option>
                    <option value="yes">Multiple suppliers OK</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="additionalNotes">Additional notes</label>
                <textarea
                  id="additionalNotes"
                  placeholder="Specs, packaging, compliance, or other details…"
                  value={form.additionalNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, additionalNotes: e.target.value }))
                  }
                />
              </div>
              <button type="submit" className="btn btn--accent" disabled={submitting}>
                {submitting ? "Saving…" : "Submit requirement"}
              </button>
            </form>
          )}

          <p className="section-title">Your requirements</p>
          {loading ? (
            <div className="loading-block">
              <span className="spinner" aria-hidden="true" />
              Loading requirements…
            </div>
          ) : !profileId ? null : requirements.length === 0 ? (
            <div className="card empty">
              <h3>No requirements yet</h3>
              <p>Create your first requirement to start matching with suppliers.</p>
            </div>
          ) : (
            <div className="match-grid">
              {requirements.map((req, index) => {
                const id = pick(req, "id", "id");
                const product = pick(req, "productRequirement", "product_requirement");
                const status = pick(req, "status", "status");
                const qty = pick(req, "quantityRequired", "quantity_required");
                const unit = pick(req, "unit", "unit");
                const budget = pick(req, "budget", "budget");
                const currency = pick(req, "currency", "currency") || "INR";
                const due = pick(req, "requiredByDate", "required_by_date");

                return (
                  <article
                    key={id}
                    className="card card--interactive fade-in"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="card-top">
                      <h3 className="card__title">{product}</h3>
                      <span className="badge badge--accent">{titleCase(status)}</span>
                    </div>
                    <p className="card__meta">
                      {pick(req, "category", "category")} · {qty} {unit} ·{" "}
                      {formatMoney(budget, currency)} · Due {formatDate(due)}
                    </p>
                    <div className="divider" />
                    <Link to={`/client/requirements/${id}`} className="btn btn--secondary">
                      View matches
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
