export type ProductDecision = "CLEAR_MATCH" | "CLEAR_REJECT" | "AMBIGUOUS";

interface ProductDecisionInput {
  semanticScore: number;
  productSignal: number;
}

export const decideProductCompatibility = ({
  semanticScore,
  productSignal,
}: ProductDecisionInput): ProductDecision => {
  /*
   * Conservative rules:
   *
   * 1. Very low semantic similarity + no product signal
   *    => clearly unrelated.
   *
   * 2. Exact product signal + reasonable semantic similarity
   *    => clear match.
   *
   * 3. Everything else => ambiguous.
   *
   * Ambiguous cases will later be sent to the local LLM.
   */

  if (semanticScore < 0.6 && productSignal === 0) {
    return "CLEAR_REJECT";
  }

  if (productSignal === 1 && semanticScore >= 0.7) {
    return "CLEAR_MATCH";
  }

  return "AMBIGUOUS";
};
