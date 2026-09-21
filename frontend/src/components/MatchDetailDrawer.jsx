import { useEffect, useState } from "react";
import { api } from "../api/client";
import MatchStatusBadge from "./MatchStatusBadge";
import ScoreRing from "./ScoreRing";
import { formatDate, formatMoney, titleCase } from "../utils/format";
import {
  formatRatioPercent,
  formatScoreDecimal,
  getMatchField,
  matchId,
  textOrDash,
} from "../utils/matchFields";

function DetailRow({ label, value }) {
  return (
    <div className="match-detail__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ScoreBlock({ title, status, explanation, extra }) {
  return (
    <div className="match-detail__block">
      <div className="match-detail__block-head">
        <h4>{title}</h4>
        {status && <span className="match-detail__status">{titleCase(status)}</span>}
      </div>
      {extra && <p className="match-detail__meta">{extra}</p>}
      {explanation && <p className="match-detail__explain">{explanation}</p>}
    </div>
  );
}

export default function MatchDetailDrawer({
  match: initialMatch,
  requirementId,
  onClose,
}) {
  const [match, setMatch] = useState(initialMatch);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMatch(initialMatch);
  }, [initialMatch]);

  useEffect(() => {
    const id = matchId(initialMatch);
    if (!id || !requirementId) return;

    let cancelled = false;
    setLoading(true);
    api
      .getMatchDetail(requirementId, id)
      .then((res) => {
        if (!cancelled && res.match) setMatch(res.match);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialMatch, requirementId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!match) return null;

  const percentage = getMatchField(match, "matchPercentage", "match_percentage");
  const product = getMatchField(match, "productOffered", "product_offered");
  const supplier = getMatchField(match, "supplierName", "supplier_name");
  const currency = getMatchField(match, "currency", "currency") || "INR";

  return (
    <div className="match-drawer" role="dialog" aria-modal="true" aria-labelledby="match-detail-title">
      <button type="button" className="match-drawer__backdrop" onClick={onClose} aria-label="Close" />
      <div className="match-drawer__panel">
        <header className="match-drawer__header">
          <div>
            <p className="match-detail__kicker">Match analysis</p>
            <h2 id="match-detail-title">{product}</h2>
            <p className="card__meta">{supplier}</p>
          </div>
          <button type="button" className="match-drawer__close" onClick={onClose}>×</button>
        </header>

        {loading && (
          <p className="match-detail__loading card__meta">Refreshing latest details…</p>
        )}

        <div className="match-detail__hero">
          <ScoreRing value={percentage} size="lg" />
          <div className="match-detail__hero-stats">
            <div>
              <strong>{formatScoreDecimal(getMatchField(match, "matchScore", "match_score"))}</strong>
              <span>Composite score</span>
            </div>
            <div>
              <strong>{formatRatioPercent(getMatchField(match, "semanticScore", "semantic_score"))}</strong>
              <span>Semantic similarity</span>
            </div>
            <div>
              <strong>{formatRatioPercent(getMatchField(match, "quantityCoverage", "quantity_coverage"))}</strong>
              <span>Quantity coverage</span>
            </div>
            <MatchStatusBadge record={match} />
          </div>
        </div>

        <div className="match-detail__sections">
          <ScoreBlock
            title="Product compatibility"
            status={getMatchField(match, "productDecision", "product_decision")}
            explanation={textOrDash(
              getMatchField(match, "productReason", "product_reason"),
            )}
            extra={`Requirement: ${textOrDash(getMatchField(match, "productRequirement", "product_requirement"))} · Offering: ${textOrDash(product)}`}
          />

          <ScoreBlock
            title="Budget fit"
            status={getMatchField(match, "budgetStatus", "budget_status")}
            explanation={textOrDash(
              getMatchField(match, "budgetExplanation", "budget_explanation"),
            )}
            extra={`Client budget: ${formatMoney(
              getMatchField(match, "requirementBudget", "requirement_budget"),
              getMatchField(match, "requirementCurrency", "requirement_currency") || currency,
            )} (${titleCase(getMatchField(match, "requirementBudgetType", "requirement_budget_type"))}) · Supplier price: ${formatMoney(
              getMatchField(match, "price", "price"),
              currency,
            )} (${titleCase(getMatchField(match, "priceType", "price_type"))})`}
          />

          <ScoreBlock
            title="Delivery fit"
            status={getMatchField(match, "deliveryStatus", "delivery_status")}
            explanation={textOrDash(
              getMatchField(match, "deliveryExplanation", "delivery_explanation"),
            )}
            extra={`Required by ${formatDate(getMatchField(match, "requiredByDate", "required_by_date"))} · Supplier lead time ${getMatchField(match, "minimumDeliveryDays", "minimum_delivery_days")}–${getMatchField(match, "maximumDeliveryDays", "maximum_delivery_days")} days`}
          />

          <section className="match-detail__block">
            <h4>Your requirement</h4>
            <dl className="match-detail__dl">
              <DetailRow
                label="Category"
                value={textOrDash(getMatchField(match, "requirementCategory", "requirement_category"))}
              />
              <DetailRow
                label="Quantity"
                value={`${textOrDash(getMatchField(match, "quantityRequired", "quantity_required"))} ${textOrDash(getMatchField(match, "requirementUnit", "requirement_unit"))}`}
              />
              <DetailRow
                label="Delivery location"
                value={textOrDash(
                  getMatchField(match, "requirementDeliveryLocation", "requirement_delivery_location"),
                )}
              />
              <DetailRow
                label="Specifications"
                value={textOrDash(
                  getMatchField(match, "requirementSpecifications", "requirement_specifications"),
                )}
              />
              <DetailRow
                label="Quality grade"
                value={textOrDash(
                  getMatchField(match, "requirementQualityGrade", "requirement_quality_grade"),
                )}
              />
              <DetailRow
                label="Notes"
                value={textOrDash(
                  getMatchField(match, "requirementAdditionalNotes", "requirement_additional_notes"),
                )}
              />
            </dl>
          </section>

          <section className="match-detail__block">
            <h4>Supplier offering</h4>
            <dl className="match-detail__dl">
              <DetailRow
                label="Category"
                value={textOrDash(getMatchField(match, "offeringCategory", "offering_category"))}
              />
              <DetailRow
                label="Available quantity"
                value={`${textOrDash(getMatchField(match, "availableQuantity", "available_quantity"))} ${textOrDash(getMatchField(match, "offeringUnit", "offering_unit"))}`}
              />
              <DetailRow
                label="Fulfillment location"
                value={textOrDash(getMatchField(match, "fulfillmentLocation", "fulfillment_location"))}
              />
              <DetailRow
                label="Pricing notes"
                value={textOrDash(getMatchField(match, "pricingNotes", "pricing_notes"))}
              />
              <DetailRow
                label="Specifications"
                value={textOrDash(
                  getMatchField(match, "offeringSpecifications", "offering_specifications"),
                )}
              />
              <DetailRow
                label="Quality grade"
                value={textOrDash(getMatchField(match, "offeringQualityGrade", "offering_quality_grade"))}
              />
              <DetailRow
                label="Notes"
                value={textOrDash(
                  getMatchField(match, "offeringAdditionalNotes", "offering_additional_notes"),
                )}
              />
            </dl>
          </section>

          <section className="match-detail__block match-detail__block--supplier">
            <h4>Supplier contact</h4>
            <dl className="match-detail__dl">
              <DetailRow label="Business" value={textOrDash(supplier)} />
              <DetailRow
                label="Contact person"
                value={textOrDash(getMatchField(match, "contactPerson", "contact_person"))}
              />
              <DetailRow
                label="Email"
                value={textOrDash(getMatchField(match, "supplierEmail", "supplier_email"))}
              />
              <DetailRow
                label="Phone"
                value={textOrDash(getMatchField(match, "supplierPhone", "supplier_phone"))}
              />
              <DetailRow
                label="Location"
                value={textOrDash(getMatchField(match, "businessLocation", "business_location"))}
              />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
