import { pick } from "./format";

export function matchId(match) {
  return pick(match, "id", "id");
}

export function formatRatioPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
}

export function formatScoreDecimal(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(4);
}

export function textOrDash(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "—";
  }
  return String(value);
}

export function getMatchField(match, camel, snake) {
  return pick(match, camel, snake);
}
