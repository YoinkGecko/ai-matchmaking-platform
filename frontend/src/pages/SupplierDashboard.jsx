import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import FadeIn from "../components/FadeIn";
import OfferingChatPanel from "../components/OfferingChatPanel";
import OfferingPhotoGallery from "../components/OfferingPhotoGallery";
import ProfileLinkBanner from "../components/ProfileLinkBanner";
import SupplierMatchCard from "../components/SupplierMatchCard";
import SupplierOrderCard from "../components/SupplierOrderCard";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, pick } from "../utils/format";

const SUPPLIER_TABS = [
  { id: "offerings", label: "Your offerings" },
  { id: "orders", label: "Order requests" },
  { id: "matches", label: "Client matches" },
  { id: "messages", label: "Messages" },
];

const emptyOffering = {
  productOffered: "",
  category: "",
  availableQuantity: "",
  unit: "units",
  specifications: "",
  qualityGrade: "",
  price: "",
  currency: "INR",
  priceType: "PER_UNIT",
  pricingNotes: "",
  fulfillmentLocation: "",
  minimumDeliveryDays: "3",
  maximumDeliveryDays: "14",
  additionalNotes: "",
};

function offeringToForm(item) {
  return {
    productOffered: pick(item, "productOffered", "product_offered") || "",
    category: pick(item, "category", "category") || "",
    availableQuantity: String(
      pick(item, "availableQuantity", "available_quantity") ?? "",
    ),
    unit: pick(item, "unit", "unit") || "units",
    specifications: pick(item, "specifications", "specifications") || "",
    qualityGrade: pick(item, "qualityGrade", "quality_grade") || "",
    price: String(pick(item, "price", "price") ?? ""),
    currency: pick(item, "currency", "currency") || "INR",
    priceType: pick(item, "priceType", "price_type") || "PER_UNIT",
    pricingNotes: pick(item, "pricingNotes", "pricing_notes") || "",
    fulfillmentLocation:
      pick(item, "fulfillmentLocation", "fulfillment_location") || "",
    minimumDeliveryDays: String(
      pick(item, "minimumDeliveryDays", "minimum_delivery_days") ?? "3",
    ),
    maximumDeliveryDays: String(
      pick(item, "maximumDeliveryDays", "maximum_delivery_days") ?? "14",
    ),
    additionalNotes: pick(item, "additionalNotes", "additional_notes") || "",
  };
}

export default function SupplierDashboard() {
  const { profileId } = useAuth();
  const [tab, setTab] = useState("offerings");
  const [supplier, setSupplier] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOfferingId, setEditingOfferingId] = useState(null);
  const [form, setForm] = useState(emptyOffering);
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const loadData = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [supplierRes, offeringsRes, matchesRes, ordersRes, chatsRes] =
        await Promise.all([
          api.getSupplier(profileId),
          api.getOfferings(profileId),
          api.getSupplierMatches(profileId),
          api.getMySupplierOrders().catch(() => ({ data: [] })),
          api.getMySupplierChats().catch(() => ({ data: [] })),
        ]);
      setSupplier(supplierRes.data);
      setOfferings(offeringsRes.data || []);
      setMatches(matchesRes.matches || []);
      setOrders(ordersRes.data || []);
      setChats(chatsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeOfferingForm = () => {
    setShowForm(false);
    setEditingOfferingId(null);
    setForm(emptyOffering);
    setPhotoFiles([]);
  };

  const startEditOffering = (item) => {
    setEditingOfferingId(pick(item, "id", "id"));
    setForm(offeringToForm(item));
    setPhotoFiles([]);
    setShowForm(true);
    setError("");
    setInfo("");
  };

  const handleOfferingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      ...form,
      availableQuantity: Number(form.availableQuantity),
      price: Number(form.price),
      currency: form.currency || "INR",
      minimumDeliveryDays: Number(form.minimumDeliveryDays),
      maximumDeliveryDays: Number(form.maximumDeliveryDays),
      specifications: form.specifications || undefined,
      qualityGrade: form.qualityGrade || undefined,
      pricingNotes: form.pricingNotes || undefined,
      additionalNotes: form.additionalNotes || undefined,
    };
    try {
      if (editingOfferingId) {
        await api.updateMyOffering(editingOfferingId, payload);
        closeOfferingForm();
        await loadData();
        setInfo(
          "Offering updated. Matched and messaging clients are emailed — large price drops are highlighted.",
        );
      } else {
        await api.createOffering(profileId, payload, photoFiles);
        closeOfferingForm();
        setTab("offerings");
        await loadData();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const supplierName =
    pick(supplier, "supplierName", "supplier_name") || "Your business";

  const pendingOrders = orders.filter(
    (o) => pick(o, "status", "status") === "PENDING",
  ).length;

  return (
    <div className="page-panel client-hub stack-lg">
      <FadeIn>
        <div className="page-header page-header--row">
          <div>
            <h1>Supplier hub</h1>
            <p>
              Manage your catalog, respond to orders, review AI matches, and negotiate with buyers.
            </p>
          </div>
          {profileId && (
            <div className="btn-row">
              <Link to="/supplier/settings" className="btn btn--secondary">
                Settings
              </Link>
              {tab === "offerings" && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => (showForm ? closeOfferingForm() : setShowForm(true))}
                >
                  {showForm ? "Cancel" : "New offering"}
                </button>
              )}
            </div>
          )}
        </div>
      </FadeIn>

      {profileId && supplier && (
        <div className="client-hub__banner org-banner fade-in">
          <div>
            <strong>{supplierName}</strong>
            <p className="card__meta">
              {pick(supplier, "businessLocation", "business_location")} ·{" "}
              {pick(supplier, "email", "email")}
            </p>
          </div>
          <div className="client-hub__kpis">
            <div className="client-hub__kpi">
              <span>{offerings.length}</span>
              <small>Listings</small>
            </div>
            <div className="client-hub__kpi">
              <span>{matches.length}</span>
              <small>Matches</small>
            </div>
            <div className="client-hub__kpi client-hub__kpi--accent">
              <span>{pendingOrders}</span>
              <small>Pending orders</small>
            </div>
            <div className="client-hub__kpi">
              <span>{chats.length}</span>
              <small>Chats</small>
            </div>
          </div>
        </div>
      )}

      <ProfileLinkBanner label="supplier" />

      {error && <div className="alert alert--error">{error}</div>}
      {info && <div className="alert alert--success">{info}</div>}

      <nav className="client-hub-tabs" aria-label="Supplier workspace">
        {SUPPLIER_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`client-hub-tabs__item ${tab === item.id ? "client-hub-tabs__item--active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === "orders" && pendingOrders > 0 && (
              <span className="client-hub-tabs__badge">{pendingOrders}</span>
            )}
            {item.id === "messages" && chats.length > 0 && (
              <span className="client-hub-tabs__badge">{chats.length}</span>
            )}
            {item.id === "matches" && matches.length > 0 && (
              <span className="client-hub-tabs__badge client-hub-tabs__badge--muted">
                {matches.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {!profileId ? null : loading ? (
        <div className="loading-block">
          <span className="spinner" aria-hidden="true" />
          Loading workspace…
        </div>
      ) : (
        <>
          {tab === "offerings" && (
            <div className="stack stack-lg">
              {showForm && (
                <form className="card stack fade-in" onSubmit={handleOfferingSubmit}>
                  <h2>
                    {editingOfferingId ? "Edit offering" : "Publish offering"}
                  </h2>
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
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="fulfillmentLocation">Fulfillment location</label>
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
                        onChange={(e) =>
                          setForm((f) => ({ ...f, priceType: e.target.value }))
                        }
                      >
                        <option value="PER_UNIT">Per unit</option>
                        <option value="TOTAL">Total</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor="specifications">Specifications</label>
                      <textarea
                        id="specifications"
                        value={form.specifications}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, specifications: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="qualityGrade">Quality grade</label>
                      <input
                        id="qualityGrade"
                        value={form.qualityGrade}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, qualityGrade: e.target.value }))
                        }
                      />
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
                      <label htmlFor="minDays">Delivery (min days)</label>
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
                      <label htmlFor="maxDays">Delivery (max days)</label>
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
                  {!editingOfferingId && (
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
                        Up to 6 images. Shown to clients in marketplace and match results.
                      </span>
                    </div>
                  )}
                  <button type="submit" className="btn btn--accent" disabled={submitting}>
                    {submitting
                      ? "Saving…"
                      : editingOfferingId
                        ? "Save changes"
                        : "Publish to marketplace"}
                  </button>
                </form>
              )}

              <p className="client-hub__lead">
                Listings appear in the client marketplace and enter the AI matching pool.
              </p>

              {offerings.length === 0 ? (
                <div className="card empty">
                  <h3>No offerings yet</h3>
                  <p>Publish your first product to start receiving matches and messages.</p>
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={() => setShowForm(true)}
                  >
                    Create listing
                  </button>
                </div>
              ) : (
                <div className="marketplace-grid">
                  {offerings.map((item, index) => {
                    const id = pick(item, "id", "id");
                    const product = pick(item, "productOffered", "product_offered");
                    const qty = pick(item, "availableQuantity", "available_quantity");
                    const unit = pick(item, "unit", "unit");
                    const price = pick(item, "price", "price");
                    const currency = pick(item, "currency", "currency") || "INR";
                    const location = pick(
                      item,
                      "fulfillmentLocation",
                      "fulfillment_location",
                    );

                    return (
                      <article
                        key={id}
                        className="marketplace-card card fade-in"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <OfferingPhotoGallery record={item} variant="card" />
                        <div className="marketplace-card__body">
                          <span className="marketplace-card__category">
                            {pick(item, "category", "category")}
                          </span>
                          <h3 className="card__title">{product}</h3>
                          <p className="card__meta">
                            {qty} {unit} · {formatMoney(price, currency)} · {location}
                          </p>
                          <div className="btn-row" style={{ marginTop: "0.75rem" }}>
                            <button
                              type="button"
                              className="btn btn--secondary"
                              onClick={() => startEditOffering(item)}
                            >
                              Edit listing
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="stack">
              <p className="client-hub__lead">
                Accept or decline client order requests placed after AI matching.
              </p>
              {orders.length === 0 ? (
                <div className="card empty">
                  <h3>No order requests yet</h3>
                  <p>Clients place orders from match results — you will be notified by email.</p>
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
          )}

          {tab === "matches" && (
            <div className="stack">
              <div className="client-hub__hero card">
                <h2>AI match feed</h2>
                <p className="card__meta">
                  When client requirements align with your offerings, scored matches appear here and you receive email alerts.
                </p>
              </div>
              {matches.length === 0 ? (
                <div className="card empty">
                  <h3>No matches yet</h3>
                  <p>Keep listings accurate and complete to improve semantic match quality.</p>
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
          )}

          {tab === "messages" && (
            <div className="stack">
              <p className="client-hub__lead">
                Negotiate pricing and terms with buyers. Each message emails both parties.
              </p>
              {chats.length === 0 ? (
                <div className="card empty">
                  <h3>No conversations yet</h3>
                  <p>Clients can message you from the marketplace on any of your offerings.</p>
                </div>
              ) : (
                <div className="chat-inbox">
                  {chats.map((chat) => {
                    const cid = pick(chat, "id", "id");
                    return (
                      <button
                        key={cid}
                        type="button"
                        className="chat-inbox__item card"
                        onClick={() =>
                          setActiveChat({
                            conversationId: cid,
                            product: pick(chat, "productOffered", "product_offered"),
                            client: pick(chat, "companyName", "company_name"),
                          })
                        }
                      >
                        <div className="card-top">
                          <h3 className="card__title">
                            {pick(chat, "productOffered", "product_offered")}
                          </h3>
                          <span className="card__meta">
                            {pick(chat, "companyName", "company_name")}
                          </span>
                        </div>
                        <p className="card__meta chat-inbox__preview">
                          {chat.last_message || "No messages yet"}
                        </p>
                        {chat.last_message_at && (
                          <p className="card__meta">
                            Updated {formatDate(chat.last_message_at)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {activeChat && (
                <OfferingChatPanel
                  conversationId={activeChat.conversationId}
                  productTitle={activeChat.product}
                  counterpartyName={activeChat.client}
                  onClose={() => {
                    setActiveChat(null);
                    loadData();
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
