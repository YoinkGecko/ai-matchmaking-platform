export interface MatchScoreInput {
  semanticScore: number;

  productDecision:
    | "EXACT_MATCH"
    | "CLOSE_MATCH"
    | "RELATED_BUT_DIFFERENT"
    | "INCOMPATIBLE"
    | "CLEAR_REJECT";

  quantityCoverage: number;

  budgetStatus: "WITHIN_BUDGET" | "OVER_BUDGET" | "QUOTE_REQUIRED";

  deliveryStatus: "ON_TIME" | "LATE" | "UNCERTAIN";
}

export interface MatchScoreResult {
  score: number;
  percentage: number;
}

export const calculateMatchScore = (
  input: MatchScoreInput,
): MatchScoreResult => {
  // Hard rejection
  if (
    input.productDecision === "INCOMPATIBLE" ||
    input.productDecision === "CLEAR_REJECT"
  ) {
    return {
      score: 0,
      percentage: 0,
    };
  }

  const semanticScore = Math.max(0, Math.min(1, input.semanticScore));

  const quantityScore = Math.max(0, Math.min(1, input.quantityCoverage));

  const budgetScore =
    input.budgetStatus === "WITHIN_BUDGET"
      ? 1
      : input.budgetStatus === "QUOTE_REQUIRED"
        ? 0.5
        : 0;

  const deliveryScore =
    input.deliveryStatus === "ON_TIME"
      ? 1
      : input.deliveryStatus === "UNCERTAIN"
        ? 0.5
        : 0;

  const score =
    semanticScore * 0.4 +
    quantityScore * 0.2 +
    budgetScore * 0.2 +
    deliveryScore * 0.2;

  return {
    score,
    percentage: Math.round(score * 100),
  };
};
