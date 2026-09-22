import { useState } from "react";
import OfferingPhotoGallery from "./OfferingPhotoGallery";
import SupplierLocationMap from "./SupplierLocationMap";
import { formatMoney, pick, titleCase } from "../utils/format";

export default function MarketplaceOfferingCard({
  offering,
  requirements,
  onRunMatch,
  matchingId,
}) {
  const [selectedReq, setSelectedReq] = useState(
    requirements[0] ? pick(requirements[0], "id", "id") : "",
  );
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [showSupplier, setShowSupplier] = useState(false);
  const [mapView, setMapView] = useState("business");

  const id = pick(offering, "id", "id");
  const product = pick(offering, "productOffered", "product_offered");
  const supplier = pick(offering, "supplierName", "supplier_name");
  const contact = pick(offering, "contactPerson", "contact_person");
  const supplierEmail = pick(offering, "supplierEmail", "supplier_email");
  const supplierPhone = pick(offering, "supplierPhone", "supplier_phone");
  const businessLocation = pick(offering, "businessLocation", "business_location");
  const fulfillmentLocation = pick(
    offering,
    "fulfillmentLocation",
    "fulfillment_location",
  );
  const qty = pick(offering, "availableQuantity", "available_quantity");
  const unit = pick(offering, "unit", "unit");
  const price = pick(offering, "price", "price");
  const currency = pick(offering, "currency", "currency") || "INR";
  const priceType = pick(offering, "priceType", "price_type");
  const minD = pick(offering, "minimumDeliveryDays", "minimum_delivery_days");
  const maxD = pick(offering, "maximumDeliveryDays", "maximum_delivery_days");
  const isRunning = matchingId === id;

  const mapAddress =
    mapView === "fulfillment" && fulfillmentLocation
      ? fulfillmentLocation
      : businessLocation || fulfillmentLocation;

  const handleRunMatch = () => {
    if (!selectedReq) return;
    onRunMatch?.(selectedReq, offering);
    setShowMatchPanel(false);
  };

  return (
    <article className="marketplace-card card">
      <OfferingPhotoGallery record={offering} variant="card" />
      <div className="marketplace-card__body stack">
        <div className="card-top">
          <div>
            <span className="marketplace-card__category">
              {pick(offering, "category", "category")}
            </span>
            <h3 className="card__title">{product}</h3>
            <p className="card__meta">
              {supplier}
              {fulfillmentLocation ? ` · Ships from ${fulfillmentLocation}` : ""}
            </p>
          </div>
        </div>

        <div className="marketplace-card__stats">
          <div>
            <strong>{formatMoney(price, currency)}</strong>
            <span>{titleCase(priceType || "per_unit")}</span>
          </div>
          <div>
            <strong>{qty}</strong>
            <span>{unit} available</span>
          </div>
          <div>
            <strong>{minD}–{maxD}</strong>
            <span>days delivery</span>
          </div>
        </div>

        {offering.pricing_notes && (
          <p className="card__meta">{offering.pricing_notes}</p>
        )}

        <div className="marketplace-supplier-panel">
          <button
            type="button"
            className="marketplace-supplier-panel__toggle"
            onClick={() => setShowSupplier((v) => !v)}
            aria-expanded={showSupplier}
          >
            {showSupplier ? "Hide supplier details" : "Supplier information & map"}
          </button>

          {showSupplier && (
            <div className="marketplace-supplier-panel__content stack">
              <dl className="marketplace-supplier-dl">
                <div>
                  <dt>Supplier</dt>
                  <dd>{supplier || "—"}</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>{contact || "—"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    {supplierEmail ? (
                      <a href={`mailto:${supplierEmail}`}>{supplierEmail}</a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{supplierPhone || "—"}</dd>
                </div>
                <div>
                  <dt>Business location</dt>
                  <dd>{businessLocation || "—"}</dd>
                </div>
                <div>
                  <dt>Fulfillment</dt>
                  <dd>{fulfillmentLocation || "—"}</dd>
                </div>
              </dl>

              {(businessLocation || fulfillmentLocation) && (
                <div className="stack">
                  <div className="btn-row">
                    {businessLocation && (
                      <button
                        type="button"
                        className={`btn btn--secondary ${mapView === "business" ? "btn--map-active" : ""}`}
                        onClick={() => setMapView("business")}
                      >
                        Business on map
                      </button>
                    )}
                    {fulfillmentLocation && (
                      <button
                        type="button"
                        className={`btn btn--secondary ${mapView === "fulfillment" ? "btn--map-active" : ""}`}
                        onClick={() => setMapView("fulfillment")}
                      >
                        Fulfillment on map
                      </button>
                    )}
                  </div>
                  <SupplierLocationMap
                    title={
                      mapView === "fulfillment"
                        ? "Fulfillment location"
                        : "Business location"
                    }
                    address={mapAddress}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="marketplace-card__actions btn-row">
          <button
            type="button"
            className="btn btn--accent"
            onClick={() => setShowMatchPanel((v) => !v)}
            disabled={!requirements.length}
          >
            {isRunning ? "Matching…" : "AI match & order"}
          </button>
        </div>

        {!requirements.length && (
          <p className="field-hint">
            Post a requirement first to run AI matching against this offering.
          </p>
        )}

        {showMatchPanel && requirements.length > 0 && (
          <div className="marketplace-card__match-panel stack">
            <p className="card__meta">
              Choose an RFQ to score this supplier against, then review matches and place an order.
            </p>
            <div className="field">
              <label htmlFor={`req-${id}`}>Your requirement</label>
              <select
                id={`req-${id}`}
                value={selectedReq}
                onChange={(e) => setSelectedReq(e.target.value)}
              >
                {requirements.map((r) => {
                  const rid = pick(r, "id", "id");
                  const label = pick(r, "productRequirement", "product_requirement");
                  return (
                    <option key={rid} value={rid}>
                      {label?.slice(0, 80)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn--accent"
                disabled={isRunning || !selectedReq}
                onClick={handleRunMatch}
              >
                Run AI matching
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowMatchPanel(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
