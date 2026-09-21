import MatchStatusBadge from "./MatchStatusBadge";
import ScoreRing from "./ScoreRing";
import { formatDate, pick, titleCase } from "../utils/format";

export default function SupplierMatchCard({ match }) {
  const percentage = pick(match, "matchPercentage", "match_percentage");
  const product = pick(match, "productRequirement", "product_requirement");
  const company = pick(match, "companyName", "company_name");
  const location = pick(match, "deliveryLocation", "delivery_location");
  const due = pick(match, "requiredByDate", "required_by_date");
  const offering = pick(match, "productOffered", "product_offered");

  return (
    <article className="card card--interactive">
      <div className="card-top">
        <div>
          <h3 className="card__title">{company}</h3>
          <p className="card__meta">Needs: {product}</p>
        </div>
        <ScoreRing value={percentage} />
      </div>
      <div className="stat-row">
        <span>Your offering: {offering}</span>
        <span>Deliver to: {location}</span>
        <span>Due {formatDate(due)}</span>
      </div>
      <div className="card-footer">
        <MatchStatusBadge record={match} />
        <span className="card__meta">
          Budget {titleCase(pick(match, "budgetStatus", "budget_status"))} · Delivery{" "}
          {titleCase(pick(match, "deliveryStatus", "delivery_status"))}
        </span>
      </div>
    </article>
  );
}
