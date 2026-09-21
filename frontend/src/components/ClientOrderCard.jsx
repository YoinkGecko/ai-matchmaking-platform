import OrderStatusBadge from "./OrderStatusBadge";
import { formatDate, pick } from "../utils/format";

export default function ClientOrderCard({ order }) {
  return (
    <article className="card stack order-card">
      <div className="card-top">
        <div>
          <h3 className="card__title">
            {pick(order, "productOffered", "product_offered")}
          </h3>
          <p className="card__meta">
            {pick(order, "supplierName", "supplier_name")} ·{" "}
            {pick(order, "matchPercentage", "match_percentage")}% match
          </p>
        </div>
        <OrderStatusBadge record={order} />
      </div>
      <p className="card__meta">
        <strong>{pick(order, "quantityOrdered", "quantity_ordered")}</strong>{" "}
        {pick(order, "unit", "unit")} · Placed{" "}
        {formatDate(pick(order, "createdAt", "created_at"))}
      </p>
      <p className="card__meta">
        {pick(order, "productRequirement", "product_requirement")}
      </p>
      {order.supplier_response_notes && (
        <p className="card__meta">
          <em>Supplier:</em> {order.supplier_response_notes}
        </p>
      )}
    </article>
  );
}
