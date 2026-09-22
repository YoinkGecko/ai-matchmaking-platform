import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import FadeIn from "../components/FadeIn";
import ProfileLinkBanner from "../components/ProfileLinkBanner";
import OfferingPhotoGallery from "../components/OfferingPhotoGallery";
import SupplierMatchCard from "../components/SupplierMatchCard";
import SupplierOrderCard from "../components/SupplierOrderCard";
import { useAuth } from "../context/AuthContext";
import { formatMoney, pick } from "../utils/format";

const emptyOffering = {
  productOffered: "",
  category: "",
  availableQuantity: "",
  unit: "units",
  price: "",
  currency: "INR",
  priceType: "PER_UNIT",
  pricingNotes: "",
  fulfillmentLocation: "",
  minimumDeliveryDays: "3",
  maximumDeliveryDays: "14",
  additionalNotes: "",
};

export default function SupplierDashboard() {
  const { profileId } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyOffering);
  const [submitting, setSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);

  const loadData = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [supplierRes, offeringsRes, matchesRes, ordersRes] = await Promise.all([
        api.getSupplier(profileId),
        api.getOfferings(profileId),
        api.getSupplierMatches(profileId),
        api.getMySupplierOrders().catch(() => ({ data: [] })),
      ]);
      setSupplier(supplierRes.data);
      setOfferings(offeringsRes.data || []);
      setMatches(matchesRes.matches || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createOffering(
        profileId,
        {
          ...form,
          availableQuantity: Number(form.availableQuantity),
          price: Number(form.price),
          minimumDeliveryDays: Number(form.minimumDeliveryDays),
          maximumDeliveryDays: Number(form.maximumDeliveryDays),
          pricingNotes: form.pricingNotes || undefined,
          additionalNotes: form.additionalNotes || undefined,
        },
        photoFiles,
      );
      setForm(emptyOffering);
      setPhotoFiles([]);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const supplierName =
    pick(supplier, "supplierName", "supplier_name") || "Your business";

  return (
    <div className="page-panel stack-lg">
      <FadeIn>
        <div className="page-header page-header--row">
          <div>
            <h1>Supplier dashboard</h1>
            <p>Publish offerings and review client matches with scores and status.</p>
          </div>
          {profileId && (
            <div className="btn-row">
              <Link to="/supplier/settings" className="btn btn--secondary">
                Settings
              </Link>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? "Cancel" : "New offering"}
              </button>
            </div>
          )}
        </div>
      </FadeIn>

      {profileId && supplier && (
        <div className="org-banner fade-in">
          <div>
            <strong>{supplierName}</strong>
            <p className="card__meta">
              {pick(supplier, "businessLocation", "business_location")} ·{" "}
              {pick(supplier, "email", "email")}
            </p>
          </div>
        </div>
      )}

      <ProfileLinkBanner label="supplier" />

      {error && <div className="alert alert--error">{error}</div>}

      <div className="dashboard-grid">
        <aside className="stack">
          <p className="section-title">Overview</p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{offerings.length}</div>
              <div className="stat-card__label">Offerings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{matches.length}</div>
              <div className="stat-card__label">Client matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">
                {orders.filter((o) => pick(o, "status", "status") === "PENDING").length}
              </div>
              <div className="stat-card__label">Pending orders</div>
            </div>
          </div>
        </aside>

        <div className="stack stack-lg">
          {showForm && profileId && (
            <form className="card stack fade-in" onSubmit={handleCreate}>
              <h2>Submit offering</h2>
              <div className="field">
                <label htmlFor="supplierDisplay">Supplier name</label>
                <input id="supplierDisplay" value={supplierName} readOnly disabled />
              </div>
              <div className="field">
                <label htmlFor="productOffered">Product offered</label>
                <textarea
                  id="productOffered"
                  required
                  value={form.productOffered}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, productOffered: e.target.value }))
                  }
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="offeringCategory">Category</label>
                  <input
                    id="offeringCategory"
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fulfillmentLocation">Location (fulfillment)</label>
                  <input
                    id="fulfillmentLocation"
                    required
                    value={form.fulfillmentLocation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fulfillmentLocation: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="availableQuantity">Available quantity</label>
                  <input
                    id="availableQuantity"
                    type="number"
                    min="1"
                    required
                    value={form.availableQuantity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, availableQuantity: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="offeringUnit">Unit</label>
                  <input
                    id="offeringUnit"
                    required
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="price">Pricing (amount)</label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="priceType">Price type</label>
                  <select
                    id="priceType"
                    value={form.priceType}
                    onChange={(e) => setForm((f) => ({ ...f, priceType: e.target.value }))}
                  >
                    <option value="PER_UNIT">Per unit</option>
                    <option value="TOTAL">Total</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="pricingNotes">Pricing details / notes</label>
                <textarea
                  id="pricingNotes"
                  placeholder="MOQ, bulk discounts, payment terms…"
                  value={form.pricingNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pricingNotes: e.target.value }))
                  }
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="minDays">Delivery capability (min days)</label>
                  <input
                    id="minDays"
                    type="number"
                    min="0"
                    required
                    value={form.minimumDeliveryDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minimumDeliveryDays: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="maxDays">Delivery capability (max days)</label>
                  <input
                    id="maxDays"
                    type="number"
                    min="0"
                    required
                    value={form.maximumDeliveryDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maximumDeliveryDays: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="offeringNotes">Additional notes</label>
                <textarea
                  id="offeringNotes"
                  value={form.additionalNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, additionalNotes: e.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="offeringPhotos">Product photos (optional)</label>
                <input
                  id="offeringPhotos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                />
                <span className="field-hint">
                  Up to 6 images (jpg, png, webp). Clients see these on match results.
                </span>
              </div>
              <button type="submit" className="btn btn--accent" disabled={submitting}>
                {submitting ? "Saving…" : "Publish offering"}
              </button>
            </form>
          )}

          <div>
            <p className="section-title">Order requests</p>
            {!loading && profileId && orders.length === 0 ? (
              <div className="card empty">
                <h3>No order requests yet</h3>
                <p>When a client places an order from a match, it appears here and you get email.</p>
              </div>
            ) : (
              <div className="match-grid">
                {orders.map((order, index) => (
                  <div
                    key={pick(order, "id", "id")}
                    className="fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SupplierOrderCard order={order} onUpdated={loadData} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="section-title">Client matches</p>
            {loading ? (
              <div className="loading-block">
                <span className="spinner" aria-hidden="true" />
                Loading…
              </div>
            ) : !profileId ? null : matches.length === 0 ? (
              <div className="card empty">
                <h3>No matches yet</h3>
                <p>When a client requirement fits your offering, matches appear here and you receive email.</p>
              </div>
            ) : (
              <div className="match-grid">
                {matches.map((match, index) => (
                  <div
                    key={match.id || `${match.requirement_id}-${match.offering_id}`}
                    className="fade-in"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <SupplierMatchCard match={match} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="section-title">Your offerings</p>
            {!loading && profileId && offerings.length === 0 ? (
              <div className="card empty">
                <h3>No offerings yet</h3>
                <p>Add your first listing to enter the AI matching pool.</p>
              </div>
            ) : (
              <div className="match-grid">
                {offerings.map((item, index) => {
                  const id = pick(item, "id", "id");
                  const product = pick(item, "productOffered", "product_offered");
                  const qty = pick(item, "availableQuantity", "available_quantity");
                  const unit = pick(item, "unit", "unit");
                  const price = pick(item, "price", "price");
                  const currency = pick(item, "currency", "currency") || "INR";
                  const location = pick(item, "fulfillmentLocation", "fulfillment_location");

                  return (
                    <article
                      key={id}
                      className="card card--interactive fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <OfferingPhotoGallery record={item} variant="card" />
                      <h3 className="card__title">{product}</h3>
                      <p className="card__meta">
                        {pick(item, "category", "category")} · {qty} {unit} ·{" "}
                        {formatMoney(price, currency)} · {location}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
