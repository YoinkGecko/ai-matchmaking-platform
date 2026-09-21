import { decideProductCompatibility } from "./product-decision.service";

import {
  evaluateProductCompatibility,
  ProductCompatibilityResult,
} from "./ai-evaluator.service";

export interface ProductCompatibilityInput {
  semanticScore: number;
  productSignal: number;

  requirement: {
    productRequirement: string;
    category: string;
    specifications?: string | null;
    qualityGrade?: string | null;
  };

  offering: {
    productOffered: string;
    category: string;
    specifications?: string | null;
    qualityGrade?: string | null;
  };
}

export const evaluateProduct = async (
  input: ProductCompatibilityInput,
): Promise<{
  decision: string;
  aiResult?: ProductCompatibilityResult;
}> => {
  const decision = decideProductCompatibility({
    semanticScore: input.semanticScore,
    productSignal: input.productSignal,
  });

  if (decision === "CLEAR_REJECT") {
    return {
      decision,
    };
  }

  if (decision === "CLEAR_MATCH") {
    return {
      decision,
    };
  }

  const aiResult = await evaluateProductCompatibility(
    input.requirement,
    input.offering,
  );

  return {
    decision: aiResult.matchType,
    aiResult,
  };
};
