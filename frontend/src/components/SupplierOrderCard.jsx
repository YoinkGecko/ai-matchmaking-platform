import { useState } from "react";
import { api } from "../api/client";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatDate, pick, titleCase } from "../utils/format";

export default function SupplierOrderCard({ order, onUpdated }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = pick(order, "status", "status");
  const isPending = status === "PENDING";
  const orderId = pick(order, "id", "id");

  const respond = async (nextStatus) => {
    setLoading(true);
    setError("");
    try {
      await api.respondToSupplierOrder(orderId, {
        status: nextStatus,
        supplierResponseNotes: notes.trim() || undefined,
      });
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card stack order-card">
      <div className="card-top">
        <div>
          <h3 className="card__title">
            {pick(order, "companyName", "company_name")}
          </h3>
          <p className="card__meta">
            {pick(order, "productOffered", "product_offered")} ·{" "}
            {pick(order, "matchPercentage", "match_percentage")}% match
          </p>
        </div>
        <OrderStatusBadge record={order} />
      </div>

      <p className="card__meta">
        <strong>{pick(order, "quantityOrdered", "quantity_ordered")}</strong>{" "}
        {pick(order, "unit", "unit")} · Required by{" "}
        {formatDate(pick(order, "requiredByDate", "required_by_date"))}
      </p>
      <p className="card__meta">
        Deliver to {pick(order, "deliveryLocation", "delivery_location")}
      </p>
      {order.client_notes && (
        <p className="card__meta">
          <em>Client notes:</em> {order.client_notes}
        </p>
      )}
      {order.supplier_response_notes && (
        <p className="card__meta">
          <em>Your response:</em> {order.supplier_response_notes}
        </p>
      )}

      <p className="card__meta">
        Contact {pick(order, "clientContact", "client_contact")} ·{" "}
        {pick(order, "clientEmail", "client_email")}
        {pick(order, "clientPhone", "client_phone")
          ? ` · ${pick(order, "clientPhone", "client_phone")}`
          : ""}
      </p>

      {error && <div className="alert alert--error">{error}</div>}

      {isPending && (
        <div className="stack">
          <div className="field">
            <label htmlFor={`notes-${orderId}`}>Message to client (optional)</label>
            <textarea
              id={`notes-${orderId}`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="MOQ confirmed, delivery ETA, payment terms…"
            />
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn--accent"
              disabled={loading}
              onClick={() => respond("ACCEPTED")}
            >
              {loading ? "Saving…" : "Accept order"}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={loading}
              onClick={() => respond("REJECTED")}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {!isPending && (
        <p className="card__meta">Responded · {titleCase(status)}</p>
      )}
    </article>
  );
}
