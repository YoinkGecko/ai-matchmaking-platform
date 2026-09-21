import { pick, titleCase } from "../utils/format";

const STATUS_CLASS = {
  PENDING: "badge--warning",
  ACCEPTED: "badge--success",
  REJECTED: "badge--danger",
  CANCELLED: "badge--neutral",
};

export default function OrderStatusBadge({ record }) {
  const status = pick(record, "status", "status") || "PENDING";
  const variant = STATUS_CLASS[status] || "badge--neutral";
  return <span className={`badge ${variant}`}>{titleCase(status)}</span>;
}
