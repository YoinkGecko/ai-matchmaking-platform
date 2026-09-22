import { useMemo } from "react";
import ScoreRing from "./ScoreRing";
import { formatMoney, pick, titleCase } from "../utils/format";

function oneLineFit(match) {
  const reason = pick(match, "productReason", "product_reason");
  if (reason && String(reason).trim()) {
    const text = String(reason).trim();
    return text.length > 140 ? `${text.slice(0, 137)}…` : text;
  }
  const decision = pick(match, "productDecision", "product_decision");
  const delivery = pick(match, "deliveryExplanation", "delivery_explanation");
  if (decision && delivery) {
    return `${titleCase(decision)} — ${delivery}`;
  }
  if (decision) {
    return titleCase(decision);
  }
  return "Open full analysis for AI product fit details.";
}

function priceLabel(match) {
  const price = pick(match, "price", "price");
  const currency = pick(match, "currency", "currency") || "INR";
  const priceType = pick(match, "priceType", "price_type");
  if (price == null || price === "") return "—";
  const base = formatMoney(price, currency);
  if (priceType === "PER_UNIT") return `${base} / unit`;
  if (priceType === "TOTAL") return `${base} total`;
  return base;
}

function deliveryLabel(match) {
  const min = pick(match, "minimumDeliveryDays", "minimum_delivery_days");
  const max = pick(match, "maximumDeliveryDays", "maximum_delivery_days");
  const status = pick(match, "deliveryStatus", "delivery_status");
  const window =
    min != null && max != null ? `${min}–${max} days` : min != null ? `${min}+ days` : "—";
  return status ? `${window} · ${titleCase(status)}` : window;
}

export default function TopSuppliersCompare({ matches, onSelectMatch }) {
  const topThree = useMemo(() => {
    const ranked = [...(matches || [])].sort(
      (a, b) =>
        Number(pick(b, "matchPercentage", "match_percentage") ?? 0) -
        Number(pick(a, "matchPercentage", "match_percentage") ?? 0),
    );
    return ranked
      .filter((m) => Number(pick(m, "matchPercentage", "match_percentage") ?? 0) > 0)
      .slice(0, 3);
  }, [matches]);

  if (topThree.length === 0) {
    return null;
  }

  return (
    <section className="compare-suppliers card stack" aria-labelledby="compare-heading">
      <div className="compare-suppliers__head">
        <div>
          <h2 id="compare-heading">Compare top suppliers</h2>
          <p className="card__meta">
            Side-by-side view of your three highest-ranked matches by AI score.
          </p>
        </div>
      </div>

      <div className="compare-suppliers__grid">
        {topThree.map((match, index) => {
          const supplier = pick(match, "supplierName", "supplier_name");
          const product = pick(match, "productOffered", "product_offered");
          const pct = pick(match, "matchPercentage", "match_percentage");
          const rank = index + 1;

          return (
            <article key={match.id || `${match.offering_id}-${rank}`} className="compare-suppliers__col">
              <div className="compare-suppliers__rank">#{rank}</div>
              <div className="compare-suppliers__supplier">
                <ScoreRing value={pct} />
                <div>
                  <h3 className="compare-suppliers__name">{supplier || "Supplier"}</h3>
                  <p className="card__meta compare-suppliers__product">{product}</p>
                </div>
              </div>

              <dl className="compare-suppliers__facts">
                <div>
                  <dt>Match score</dt>
                  <dd>{pct != null ? `${Math.round(Number(pct))}%` : "—"}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{priceLabel(match)}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>{deliveryLabel(match)}</dd>
                </div>
              </dl>

              <p className="compare-suppliers__fit">
                <span className="compare-suppliers__fit-label">AI fit</span>
                {oneLineFit(match)}
              </p>

              {onSelectMatch && (
                <button
                  type="button"
                  className="btn btn--secondary compare-suppliers__cta"
                  onClick={() => onSelectMatch(match)}
                >
                  Full analysis
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
