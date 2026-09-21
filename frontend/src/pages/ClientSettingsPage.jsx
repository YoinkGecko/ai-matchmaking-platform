import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { pick } from "../utils/format";
import { setProfileId } from "../utils/storage";

export default function ClientSettingsPage() {
  const { user, saveProfileId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMyClientProfile();
      const data = res.data;
      setForm({
        companyName: pick(data, "companyName", "company_name") || "",
        contactPerson: pick(data, "contactPerson", "contact_person") || "",
        email: pick(data, "email", "email") || user?.email || "",
        phone: pick(data, "phone", "phone") || "",
      });
      const id = pick(data, "id", "id");
      if (id && user) {
        saveProfileId(id);
        setProfileId("CLIENT", user.email, id);
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
      await api.updateMyClientProfile({
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        phone: form.phone || null,
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
        <Link to="/client" className="card__meta">← Back to dashboard</Link>
        <h1 style={{ marginTop: "0.5rem" }}>Account settings</h1>
        <p>Update your organization details. Email cannot be changed here.</p>
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
            <label htmlFor="companyName">Company / client name</label>
            <input
              id="companyName"
              required
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
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
