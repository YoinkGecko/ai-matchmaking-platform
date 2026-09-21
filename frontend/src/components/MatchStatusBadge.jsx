import { pick, titleCase } from "../utils/format";

const STATUS_CLASS = {
  SUGGESTED: "badge--accent",
  VIEWED: "badge--neutral",
  SHORTLISTED: "badge--success",
  ACCEPTED: "badge--success",
  REJECTED: "badge--danger",
};

export default function MatchStatusBadge({ record }) {
  const status = pick(record, "status", "status") || "SUGGESTED";
  const variant = STATUS_CLASS[status] || "badge--neutral";

  return <span className={`badge ${variant}`}>{titleCase(status)}</span>;
}
