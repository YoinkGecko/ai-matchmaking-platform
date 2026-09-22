import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { formatDate, titleCase } from "../utils/format";

const WARNING_TEMPLATE =
  "Your recent chat message was reported for inappropriate or unprofessional content. Please keep negotiations respectful and policy-compliant.";

export default function AdminModerationPanel({ users, onUsersRefresh }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warningText, setWarningText] = useState(WARNING_TEMPLATE);
  const [activeReport, setActiveReport] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminReports();
      setReports(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const findUserId = (email, role) => {
    const row = users.find(
      (u) =>
        u.email?.toLowerCase() === email?.toLowerCase() &&
        u.role === role,
    );
    return row?.id;
  };

  const handleWarn = async (report) => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await api.adminSendWarning({
        email: report.reported_email,
        role: report.reported_role,
        message: warningText,
        reportId: report.id,
      });
      setInfo(`Warning emailed to ${report.reported_email}`);
      setActiveReport(null);
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (email, role, status) => {
    const userId = findUserId(email, role);
    if (!userId) {
      setError(`No user record for ${email} (${role})`);
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await api.adminSetUserStatus(userId, status);
      setInfo(`Account ${email} set to ${status}`);
      if (onUsersRefresh) await onUsersRefresh();
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = async (reportId) => {
    setBusy(true);
    setError("");
    try {
      await api.adminDismissReport(reportId);
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-block">
        <span className="spinner" aria-hidden="true" />
        Loading reports…
      </div>
    );
  }

  return (
    <div className="stack stack-lg">
      <p className="client-hub__lead">
        Review chat reports from clients and suppliers. Send email warnings or suspend accounts.
      </p>

      {error && <div className="alert alert--error">{error}</div>}
      {info && <div className="alert alert--success">{info}</div>}

      {reports.length === 0 ? (
        <div className="card empty">
          <h3>No reports</h3>
          <p>When users report a chat message, it will appear here.</p>
        </div>
      ) : (
        <div className="stack">
          {reports.map((report) => (
            <article key={report.id} className="card moderation-card stack">
              <div className="moderation-card__top">
                <span className={`badge ${report.status === "OPEN" ? "badge--warning" : "badge--neutral"}`}>
                  {titleCase(report.status)}
                </span>
                <span className="card__meta">{formatDate(report.created_at)}</span>
              </div>
              <p className="card__meta">
                <strong>Offering:</strong> {report.product_offered} ·{" "}
                {report.company_name} ↔ {report.supplier_name}
              </p>
              <p className="card__meta">
                <strong>Reporter:</strong> {report.reporter_email} ({report.reporter_role}) ·{" "}
                <strong>Reported:</strong> {report.reported_email} ({report.reported_role})
              </p>
              <blockquote className="moderation-card__quote">{report.message_body}</blockquote>
              {report.reason && (
                <p className="card__meta">
                  <strong>Reason:</strong> {report.reason}
                </p>
              )}

              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={busy}
                  onClick={() => {
                    setActiveReport(report);
                    setWarningText(WARNING_TEMPLATE);
                  }}
                >
                  Send warning
                </button>
                <button
                  type="button"
                  className="btn btn--accent"
                  disabled={busy}
                  onClick={() =>
                    handleStatus(report.reported_email, report.reported_role, "SUSPENDED")
                  }
                >
                  Suspend account
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={busy}
                  onClick={() =>
                    handleStatus(report.reported_email, report.reported_role, "ACTIVE")
                  }
                >
                  Activate account
                </button>
                {report.status === "OPEN" && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() => handleDismiss(report.id)}
                  >
                    Dismiss
                  </button>
                )}
              </div>

              {activeReport?.id === report.id && (
                <div className="stack moderation-card__warn-form">
                  <label className="field">
                    <span>Warning email text</span>
                    <textarea
                      rows={4}
                      value={warningText}
                      onChange={(e) => setWarningText(e.target.value)}
                    />
                  </label>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn btn--accent"
                      disabled={busy || !warningText.trim()}
                      onClick={() => handleWarn(report)}
                    >
                      {busy ? "Sending…" : "Email warning"}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setActiveReport(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
