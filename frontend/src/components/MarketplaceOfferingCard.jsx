import { useState } from "react";
import OfferingPhotoGallery from "./OfferingPhotoGallery";
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

  const id = pick(offering, "id", "id");
  const product = pick(offering, "productOffered", "product_offered");
  const supplier = pick(offering, "supplierName", "supplier_name");
  const location =
    pick(offering, "fulfillmentLocation", "fulfillment_location") ||
    pick(offering, "businessLocation", "business_location");
  const qty = pick(offering, "availableQuantity", "available_quantity");
  const unit = pick(offering, "unit", "unit");
  const price = pick(offering, "price", "price");
  const currency = pick(offering, "currency", "currency") || "INR";
  const priceType = pick(offering, "priceType", "price_type");
  const minD = pick(offering, "minimumDeliveryDays", "minimum_delivery_days");
  const maxD = pick(offering, "maximumDeliveryDays", "maximum_delivery_days");
  const isRunning = matchingId === id;

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
              {location ? ` · ${location}` : ""}
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
