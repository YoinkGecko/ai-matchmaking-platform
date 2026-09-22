import MatchStatusBadge from "./MatchStatusBadge";
import OfferingPhotoGallery from "./OfferingPhotoGallery";
import ScoreRing from "./ScoreRing";
import { formatMoney, pick, titleCase } from "../utils/format";

export default function MatchCard({ match, style, onOpen }) {
  const percentage = pick(match, "matchPercentage", "match_percentage");
  const product = pick(match, "productOffered", "product_offered");
  const supplier = pick(match, "supplierName", "supplier_name");
  const location = pick(match, "businessLocation", "business_location");
  const budgetStatus = pick(match, "budgetStatus", "budget_status");
  const deliveryStatus = pick(match, "deliveryStatus", "delivery_status");
  const productDecision = pick(match, "productDecision", "product_decision");
  const price = pick(match, "price", "price");
  const currency = pick(match, "currency", "currency") || "INR";
  const reason = match.product_reason || match.productReason;

  const handleOpen = () => onOpen?.(match);

  return (
    <article
      className="card card--interactive fade-in match-card"
      style={style}
    >
      <button type="button" className="match-card__hit" onClick={handleOpen}>
        <OfferingPhotoGallery record={match} variant="card" />
        <div className="card-top">
          <div>
            <h3 className="card__title">{product}</h3>
            <p className="card__meta">
              {supplier}
              {location ? ` · ${location}` : ""}
            </p>
          </div>
          <ScoreRing value={percentage} />
        </div>

        <div className="stat-chips">
          <span className="chip">Product: {titleCase(productDecision)}</span>
          <span className="chip">Budget: {titleCase(budgetStatus)}</span>
          <span className="chip">Delivery: {titleCase(deliveryStatus)}</span>
          {price != null && (
            <span className="chip chip--accent">{formatMoney(price, currency)}</span>
          )}
        </div>

        <div className="card-footer">
          <MatchStatusBadge record={match} />
          <span className="match-card__cta">View full analysis →</span>
        </div>

        {reason && (
          <>
            <div className="divider" />
            <p className="card__meta ai-reason">{reason}</p>
          </>
        )}
      </button>
    </article>
  );
}
