import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { pick } from "../utils/format";
import { setProfileId } from "../utils/storage";

export default function SupplierSettingsPage() {
  const { user, saveProfileId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessLocation: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMySupplierProfile();
      const data = res.data;
      setForm({
        supplierName: pick(data, "supplierName", "supplier_name") || "",
        contactPerson: pick(data, "contactPerson", "contact_person") || "",
        email: pick(data, "email", "email") || user?.email || "",
        phone: pick(data, "phone", "phone") || "",
        businessLocation: pick(data, "businessLocation", "business_location") || "",
      });
      const id = pick(data, "id", "id");
      if (id && user) {
        saveProfileId(id);
        setProfileId("SUPPLIER", user.email, id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, saveProfileId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateMySupplierProfile({
        supplierName: form.supplierName,
        contactPerson: form.contactPerson,
        phone: form.phone || null,
        businessLocation: form.businessLocation,
      });
      setSuccess("Profile saved successfully.");
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-panel stack-lg settings-page">
      <div className="page-header">
        <Link to="/supplier" className="card__meta">← Back to dashboard</Link>
        <h1 style={{ marginTop: "0.5rem" }}>Account settings</h1>
        <p>Update your business details. Email cannot be changed here.</p>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading ? (
        <div className="loading-block">
          <span className="spinner" aria-hidden="true" />
          Loading profile…
        </div>
      ) : (
        <form className="card stack settings-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} disabled readOnly />
            <span className="field-hint">Contact support to change your login email.</span>
          </div>
          <div className="field">
            <label htmlFor="supplierName">Supplier / business name</label>
            <input
              id="supplierName"
              required
              value={form.supplierName}
              onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="contactPerson">Contact person</label>
            <input
              id="contactPerson"
              required
              value={form.contactPerson}
              onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="businessLocation">Business location</label>
            <input
              id="businessLocation"
              required
              value={form.businessLocation}
              onChange={(e) =>
                setForm((f) => ({ ...f, businessLocation: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <button type="submit" className="setby-btn setby-btn--orange" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}
