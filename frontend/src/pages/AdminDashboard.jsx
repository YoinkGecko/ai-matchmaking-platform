import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import AdminDataTable from "../components/AdminDataTable";
import FadeIn from "../components/FadeIn";
import { formatDate, formatMoney, titleCase } from "../utils/format";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "clients", label: "Clients" },
  { id: "suppliers", label: "Suppliers" },
  { id: "requirements", label: "Requirements" },
  { id: "offerings", label: "Offerings" },
  { id: "matches", label: "Matches" },
];

function shortId(id) {
  if (!id) return "—";
  return `${String(id).slice(0, 8)}…`;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [matches, setMatches] = useState([]);

  const loadTab = useCallback(async (activeTab) => {
    setLoading(true);
    setError("");
    try {
      switch (activeTab) {
        case "overview": {
          const res = await api.adminOverview();
          setOverview(res.data);
          break;
        }
        case "users": {
          const res = await api.adminUsers();
          setUsers(res.data);
          break;
        }
        case "clients": {
          const res = await api.adminClients();
          setClients(res.data);
          break;
        }
        case "suppliers": {
          const res = await api.adminSuppliers();
          setSuppliers(res.data);
          break;
        }
        case "requirements": {
          const res = await api.adminRequirements();
          setRequirements(res.data);
          break;
        }
        case "offerings": {
          const res = await api.adminOfferings();
          setOfferings(res.data);
          break;
        }
        case "matches": {
          const res = await api.adminMatches();
          setMatches(res.data);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTab(tab);
  }, [tab, loadTab]);

  return (
    <div className="admin-shell page-panel">
      <FadeIn>
        <div className="page-header page-header--row">
          <div>
            <h1>Admin console</h1>
            <p>Full visibility across users, clients, suppliers, requirements, offerings, and matches.</p>
          </div>
          <span className="badge badge--warning">Superuser</span>
        </div>
      </FadeIn>

      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Admin sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav__item ${tab === item.id ? "admin-nav__item--active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-content stack">
          {error && <div className="alert alert--error">{error}</div>}

          {loading ? (
            <div className="loading-block">
              <span className="spinner" aria-hidden="true" />
              Loading {tab}…
            </div>
          ) : (
            <>
              {tab === "overview" && overview && (
                <div className="stats-grid admin-stats">
                  {Object.entries(overview).map(([key, value], i) => (
                    <div
                      key={key}
                      className="stat-card fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="stat-card__value">{value}</div>
                      <div className="stat-card__label">{titleCase(key)}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "users" && (
                <AdminDataTable
                  columns={[
                    { key: "email", label: "Email" },
                    { key: "role", label: "Role", render: (r) => titleCase(r.role) },
                    { key: "created_at", label: "Joined", render: (r) => formatDate(r.created_at) },
                    { key: "id", label: "ID", render: (r) => shortId(r.id) },
                  ]}
                  rows={users}
                />
              )}

              {tab === "clients" && (
                <AdminDataTable
                  columns={[
                    { key: "company_name", label: "Company" },
                    { key: "contact_person", label: "Contact" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    {
                      key: "requirement_count",
                      label: "Requirements",
                      render: (r) => r.requirement_count,
                    },
                    { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at) },
                  ]}
                  rows={clients}
                />
              )}

              {tab === "suppliers" && (
                <AdminDataTable
                  columns={[
                    { key: "supplier_name", label: "Supplier" },
                    { key: "contact_person", label: "Contact" },
                    { key: "email", label: "Email" },
                    { key: "business_location", label: "Location" },
                    {
                      key: "offering_count",
                      label: "Offerings",
                      render: (r) => r.offering_count,
                    },
                    { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at) },
                  ]}
                  rows={suppliers}
                />
              )}

              {tab === "requirements" && (
                <AdminDataTable
                  columns={[
                    { key: "company_name", label: "Client" },
                    { key: "product_requirement", label: "Product" },
                    { key: "category", label: "Category" },
                    {
                      key: "quantity_required",
                      label: "Qty",
                      render: (r) => `${r.quantity_required} ${r.unit}`,
                    },
                    {
                      key: "budget",
                      label: "Budget",
                      render: (r) => formatMoney(r.budget, r.currency || "INR"),
                    },
                    { key: "delivery_location", label: "Location" },
                    { key: "status", label: "Status", render: (r) => titleCase(r.status) },
                    { key: "match_count", label: "Matches" },
                  ]}
                  rows={requirements}
                />
              )}

              {tab === "offerings" && (
                <AdminDataTable
                  columns={[
                    { key: "supplier_name", label: "Supplier" },
                    { key: "product_offered", label: "Product" },
                    { key: "category", label: "Category" },
                    {
                      key: "available_quantity",
                      label: "Qty",
                      render: (r) => `${r.available_quantity} ${r.unit}`,
                    },
                    {
                      key: "price",
                      label: "Price",
                      render: (r) => formatMoney(r.price, r.currency || "INR"),
                    },
                    { key: "fulfillment_location", label: "Location" },
                    {
                      key: "delivery",
                      label: "Delivery",
                      render: (r) => `${r.minimum_delivery_days}–${r.maximum_delivery_days}d`,
                    },
                  ]}
                  rows={offerings}
                />
              )}

              {tab === "matches" && (
                <AdminDataTable
                  columns={[
                    { key: "company_name", label: "Client" },
                    { key: "product_requirement", label: "Requirement" },
                    { key: "supplier_name", label: "Supplier" },
                    { key: "product_offered", label: "Offering" },
                    {
                      key: "match_percentage",
                      label: "Score",
                      render: (r) => `${r.match_percentage}%`,
                    },
                    { key: "status", label: "Status", render: (r) => titleCase(r.status) },
                    {
                      key: "budget_status",
                      label: "Budget",
                      render: (r) => titleCase(r.budget_status),
                    },
                    {
                      key: "delivery_status",
                      label: "Delivery",
                      render: (r) => titleCase(r.delivery_status),
                    },
                  ]}
                  rows={matches}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
