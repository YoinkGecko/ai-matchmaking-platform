import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ClientOrderCard from "../components/ClientOrderCard";
import FadeIn from "../components/FadeIn";
import MarketplaceOfferingCard from "../components/MarketplaceOfferingCard";
import OfferingChatPanel from "../components/OfferingChatPanel";
import ProfileLinkBanner from "../components/ProfileLinkBanner";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, pick, titleCase } from "../utils/format";

const CLIENT_TABS = [
  { id: "requirements", label: "Your requirements" },
  { id: "orders", label: "Orders" },
  { id: "marketplace", label: "Marketplace" },
  { id: "messages", label: "Messages" },
  { id: "matching", label: "AI matching" },
];

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

function requirementToForm(req) {
  const due = pick(req, "requiredByDate", "required_by_date");
  return {
    productRequirement: pick(req, "productRequirement", "product_requirement") || "",
    category: pick(req, "category", "category") || "",
    quantityRequired: String(pick(req, "quantityRequired", "quantity_required") ?? ""),
    unit: pick(req, "unit", "unit") || "units",
    specifications: pick(req, "specifications", "specifications") || "",
    qualityGrade: pick(req, "qualityGrade", "quality_grade") || "",
    additionalNotes: pick(req, "additionalNotes", "additional_notes") || "",
    budget: String(pick(req, "budget", "budget") ?? ""),
    currency: pick(req, "currency", "currency") || "INR",
    budgetType: pick(req, "budgetType", "budget_type") || "TOTAL",
    deliveryLocation: pick(req, "deliveryLocation", "delivery_location") || "",
    requiredByDate: due ? String(due).slice(0, 10) : "",
    allowMultipleSuppliers: Boolean(
      pick(req, "allowMultipleSuppliers", "allow_multiple_suppliers"),
    ),
  };
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { profileId } = useAuth();
  const [tab, setTab] = useState("requirements");
  const [client, setClient] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategory, setMarketCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRequirementId, setEditingRequirementId] = useState(null);
  const [form, setForm] = useState(emptyRequirement);
  const [submitting, setSubmitting] = useState(false);
  const [runningReqId, setRunningReqId] = useState(null);
  const [matchingOfferingId, setMatchingOfferingId] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const loadCore = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [clientRes, reqRes, ordersRes] = await Promise.all([
        api.getClient(profileId),
        api.getRequirements(profileId),
        api.getMyClientOrders().catch(() => ({ data: [] })),
      ]);
      setClient(clientRes.data);
      setRequirements(reqRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const loadMarketplace = useCallback(async () => {
    if (!profileId) return;
    setMarketLoading(true);
    try {
      const res = await api.getMarketplaceOfferings();
      setMarketplace(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarketLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  const loadChats = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await api.getMyClientChats();
      setChats(res.data || []);
    } catch {
      setChats([]);
    }
  }, [profileId]);

  useEffect(() => {
    if (tab === "marketplace" && profileId && marketplace.length === 0) {
      loadMarketplace();
    }
  }, [tab, profileId, marketplace.length, loadMarketplace]);

  useEffect(() => {
    if (tab === "messages" && profileId) {
      loadChats();
    }
  }, [tab, profileId, loadChats]);

  const categories = useMemo(() => {
    const set = new Set(
      marketplace.map((o) => pick(o, "category", "category")).filter(Boolean),
    );
    return [...set].sort();
  }, [marketplace]);

  const filteredMarketplace = useMemo(() => {
    const q = marketSearch.trim().toLowerCase();
    return marketplace.filter((o) => {
      const cat = pick(o, "category", "category") || "";
      if (marketCategory && cat !== marketCategory) return false;
      if (!q) return true;
      const hay = [
        pick(o, "productOffered", "product_offered"),
        pick(o, "supplierName", "supplier_name"),
        cat,
        pick(o, "fulfillmentLocation", "fulfillment_location"),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [marketplace, marketSearch, marketCategory]);

  const closeRequirementForm = () => {
    setShowForm(false);
    setEditingRequirementId(null);
    setForm(emptyRequirement);
  };

  const startEditRequirement = (req) => {
    setEditingRequirementId(pick(req, "id", "id"));
    setForm(requirementToForm(req));
    setShowForm(true);
    setError("");
    setInfo("");
  };

  const handleRequirementSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      ...form,
      quantityRequired: Number(form.quantityRequired),
      budget: Number(form.budget),
      specifications: form.specifications || undefined,
      qualityGrade: form.qualityGrade || undefined,
      additionalNotes: form.additionalNotes || undefined,
    };
    try {
      if (editingRequirementId) {
        await api.updateMyRequirement(editingRequirementId, payload);
        closeRequirementForm();
        await loadCore();
        setInfo(
          "Requirement updated. Matched suppliers are notified by email when details change.",
        );
      } else {
        await api.createRequirement(profileId, payload);
        closeRequirementForm();
        setTab("requirements");
        await loadCore();
        setInfo("Requirement posted. Run AI matching from the AI matching tab or marketplace.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const runMatchingForRequirement = async (requirementId, offeringId = null) => {
    setRunningReqId(requirementId);
    if (offeringId) setMatchingOfferingId(offeringId);
    setError("");
    setInfo("");
    try {
      await api.runMatching(requirementId);
      setInfo("AI matching complete. Review scores and place orders on the results page.");
      navigate(
        `/client/requirements/${requirementId}${offeringId ? `?offering=${offeringId}` : ""}`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningReqId(null);
      setMatchingOfferingId(null);
    }
  };

  const companyName =
    pick(client, "companyName", "company_name") || "Your company";

  const openCount = requirements.filter(
    (r) => pick(r, "status", "status") === "OPEN",
  ).length;
  const pendingOrders = orders.filter(
    (o) => pick(o, "status", "status") === "PENDING",
  ).length;

  return (
    <div className="page-panel client-hub stack-lg">
      <FadeIn>
        <div className="page-header page-header--row">
          <div>
            <h1>Procurement hub</h1>
            <p>
              Post RFQs, browse the supplier marketplace, run AI matching, and manage orders in one place.
            </p>
          </div>
          {profileId && (
            <div className="btn-row">
              <Link to="/client/settings" className="btn btn--secondary">
                Settings
              </Link>
              {tab === "requirements" && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => (showForm ? closeRequirementForm() : setShowForm(true))}
                >
                  {showForm ? "Cancel" : "New requirement"}
                </button>
              )}
            </div>
          )}
        </div>
      </FadeIn>

      {profileId && client && (
        <div className="client-hub__banner org-banner fade-in">
          <div>
            <strong>{companyName}</strong>
            <p className="card__meta">
              {pick(client, "contactPerson", "contact_person")} ·{" "}
              {pick(client, "email", "email")}
            </p>
          </div>
          <div className="client-hub__kpis">
            <div className="client-hub__kpi">
              <span>{requirements.length}</span>
              <small>RFQs</small>
            </div>
            <div className="client-hub__kpi">
              <span>{openCount}</span>
              <small>Open</small>
            </div>
            <div className="client-hub__kpi">
              <span>{orders.length}</span>
              <small>Orders</small>
            </div>
            <div className="client-hub__kpi client-hub__kpi--accent">
              <span>{pendingOrders}</span>
              <small>Pending</small>
            </div>
          </div>
        </div>
      )}

      <ProfileLinkBanner label="client" />

      {error && <div className="alert alert--error">{error}</div>}
      {info && <div className="alert alert--success">{info}</div>}

      <nav className="client-hub-tabs" aria-label="Client workspace">
        {CLIENT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`client-hub-tabs__item ${tab === item.id ? "client-hub-tabs__item--active" : ""}`}
            onClick={() => {
              setTab(item.id);
              setInfo("");
            }}
          >
            {item.label}
            {item.id === "orders" && orders.length > 0 && (
              <span className="client-hub-tabs__badge">{orders.length}</span>
            )}
            {item.id === "marketplace" && marketplace.length > 0 && (
              <span className="client-hub-tabs__badge client-hub-tabs__badge--muted">
                {marketplace.length}
              </span>
            )}
            {item.id === "messages" && chats.length > 0 && (
              <span className="client-hub-tabs__badge">{chats.length}</span>
            )}
          </button>
        ))}
      </nav>

      {!profileId ? null : loading && tab !== "marketplace" ? (
        <div className="loading-block">
          <span className="spinner" aria-hidden="true" />
          Loading workspace…
        </div>
      ) : (
        <>
          {tab === "requirements" && (
            <div className="stack stack-lg">
              {showForm && (
                <form className="card stack fade-in" onSubmit={handleRequirementSubmit}>
                  <h2>
                    {editingRequirementId
                      ? "Edit requirement"
                      : "Post a new requirement (RFQ)"}
                  </h2>
                  <div className="field">
                    <label htmlFor="companyDisplay">Company / client name</label>
                    <input id="companyDisplay" value={companyName} readOnly disabled />
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
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="deliveryLocation">Delivery location</label>
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
                        onChange={(e) =>
                          setForm((f) => ({ ...f, budgetType: e.target.value }))
                        }
                      >
                        <option value="TOTAL">Total</option>
                        <option value="PER_UNIT">Per unit</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor="requiredByDate">Required by</label>
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
                    <label htmlFor="additionalNotes">Additional notes</label>
                    <textarea
                      id="additionalNotes"
                      value={form.additionalNotes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, additionalNotes: e.target.value }))
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn--accent" disabled={submitting}>
                    {submitting
                      ? "Saving…"
                      : editingRequirementId
                        ? "Save changes"
                        : "Publish requirement"}
                  </button>
                </form>
              )}

              {requirements.length === 0 ? (
                <div className="card empty">
                  <h3>No requirements yet</h3>
                  <p>Publish an RFQ to unlock AI matching and supplier orders.</p>
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={() => setShowForm(true)}
                  >
                    Create first requirement
                  </button>
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
                        style={{ animationDelay: `${index * 50}ms` }}
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
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn btn--secondary"
                            onClick={() => startEditRequirement(req)}
                          >
                            Edit
                          </button>
                          <Link
                            to={`/client/requirements/${id}`}
                            className="btn btn--secondary"
                          >
                            View matches
                          </Link>
                          <button
                            type="button"
                            className="btn btn--accent"
                            disabled={runningReqId === id}
                            onClick={() => runMatchingForRequirement(id)}
                          >
                            {runningReqId === id ? "Running…" : "Run AI"}
                          </button>
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
                Track order requests sent to suppliers and their accept/decline responses.
              </p>
              {orders.length === 0 ? (
                <div className="card empty">
                  <h3>No orders yet</h3>
                  <p>
                    After AI matching, open a supplier result and use &quot;Place order with
                    supplier&quot;.
                  </p>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setTab("marketplace")}
                  >
                    Browse marketplace
                  </button>
                </div>
              ) : (
                <div className="match-grid">
                  {orders.map((order, index) => (
                    <div
                      key={pick(order, "id", "id")}
                      className="fade-in"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <ClientOrderCard order={order} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "marketplace" && (
            <div className="stack stack-lg">
              <div className="marketplace-toolbar card">
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="marketSearch">Search catalog</label>
                    <input
                      id="marketSearch"
                      placeholder="Product, supplier, location…"
                      value={marketSearch}
                      onChange={(e) => setMarketSearch(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="marketCategory">Category</label>
                    <select
                      id="marketCategory"
                      value={marketCategory}
                      onChange={(e) => setMarketCategory(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="card__meta">
                  {filteredMarketplace.length} listing
                  {filteredMarketplace.length === 1 ? "" : "s"} · Run AI match against your RFQ to score and order.
                </p>
              </div>

              {marketLoading ? (
                <div className="loading-block">
                  <span className="spinner" aria-hidden="true" />
                  Loading marketplace…
                </div>
              ) : filteredMarketplace.length === 0 ? (
                <div className="card empty">
                  <h3>No listings found</h3>
                  <p>Try another search or check back when suppliers publish offerings.</p>
                </div>
              ) : (
                <div className="marketplace-grid">
                  {filteredMarketplace.map((offering, index) => (
                    <div
                      key={pick(offering, "id", "id")}
                      className="fade-in"
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <MarketplaceOfferingCard
                        offering={offering}
                        requirements={requirements}
                        matchingId={matchingOfferingId}
                        onRunMatch={(reqId, off) =>
                          runMatchingForRequirement(
                            reqId,
                            pick(off, "id", "id"),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "messages" && (
            <div className="stack">
              <p className="client-hub__lead">
                Negotiate with suppliers on specific offerings. Each message triggers an email to both parties.
              </p>
              {chats.length === 0 ? (
                <div className="card empty">
                  <h3>No conversations yet</h3>
                  <p>Open a listing in Marketplace and use &quot;Chat &amp; negotiate&quot;.</p>
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={() => setTab("marketplace")}
                  >
                    Go to marketplace
                  </button>
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
                            supplier: pick(chat, "supplierName", "supplier_name"),
                          })
                        }
                      >
                        <div className="card-top">
                          <h3 className="card__title">
                            {pick(chat, "productOffered", "product_offered")}
                          </h3>
                          <span className="card__meta">
                            {pick(chat, "supplierName", "supplier_name")}
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
                  counterpartyName={activeChat.supplier}
                  onClose={() => {
                    setActiveChat(null);
                    loadChats();
                  }}
                />
              )}
            </div>
          )}

          {tab === "matching" && (
            <div className="stack stack-lg">
              <div className="client-hub__hero card">
                <h2>AI matching engine</h2>
                <p className="card__meta">
                  Semantic search + LLM product fit + budget, quantity, and delivery scoring. Results are stored and emailed to you and matched suppliers.
                </p>
              </div>

              {requirements.length === 0 ? (
                <div className="card empty">
                  <h3>Add a requirement to start matching</h3>
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={() => {
                      setTab("requirements");
                      setShowForm(true);
                    }}
                  >
                    Post requirement
                  </button>
                </div>
              ) : (
                <div className="match-grid">
                  {requirements.map((req) => {
                    const id = pick(req, "id", "id");
                    const product = pick(req, "productRequirement", "product_requirement");
                    const status = pick(req, "status", "status");

                    return (
                      <article key={id} className="card stack matching-hub-card">
                        <div className="card-top">
                          <h3 className="card__title">{product}</h3>
                          <span className="badge badge--neutral">{titleCase(status)}</span>
                        </div>
                        <p className="card__meta">
                          {pick(req, "category", "category")} ·{" "}
                          {pick(req, "deliveryLocation", "delivery_location")}
                        </p>
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn btn--accent"
                            disabled={runningReqId === id}
                            onClick={() => runMatchingForRequirement(id)}
                          >
                            {runningReqId === id ? "Running pipeline…" : "Run AI matching"}
                          </button>
                          <Link
                            to={`/client/requirements/${id}`}
                            className="btn btn--secondary"
                          >
                            View results
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
