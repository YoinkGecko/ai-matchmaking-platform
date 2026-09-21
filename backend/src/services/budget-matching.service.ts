export type BudgetMatchStatus =
  | "WITHIN_BUDGET"
  | "OVER_BUDGET"
  | "QUOTE_REQUIRED";

export interface BudgetRequirement {
  budget: number;
  budgetType: "TOTAL" | "PER_UNIT";
}

export interface SupplierPricing {
  price: number;
  priceType: "TOTAL" | "PER_UNIT";
  availableQuantity: number;
}

export interface BudgetMatchResult {
  status: BudgetMatchStatus;
  estimatedCost: number | null;
  budget: number;
  explanation: string;
}

export const evaluateBudget = (
  requirement: BudgetRequirement,
  supplier: SupplierPricing,
  requiredQuantity: number,
): BudgetMatchResult => {
  // Supplier charges per unit
  if (supplier.priceType === "PER_UNIT") {
    const estimatedCost = supplier.price * requiredQuantity;

    const budget =
      requirement.budgetType === "PER_UNIT"
        ? requirement.budget * requiredQuantity
        : requirement.budget;

    return {
      status: estimatedCost <= budget ? "WITHIN_BUDGET" : "OVER_BUDGET",

      estimatedCost,
      budget,

      explanation:
        estimatedCost <= budget
          ? "Estimated supplier cost is within the client's budget."
          : "Estimated supplier cost exceeds the client's budget.",
    };
  }

  // Supplier gave a total price.
  // We cannot safely infer the price for a smaller quantity.
  if (requirement.budgetType === "PER_UNIT") {
    return {
      status: "QUOTE_REQUIRED",
      estimatedCost: null,
      budget: requirement.budget * requiredQuantity,

      explanation:
        "Supplier provided a total price, so an exact per-unit cost cannot be inferred. Supplier confirmation is required.",
    };
  }

  // Both are TOTAL pricing.
  if (supplier.price <= requirement.budget) {
    return {
      status: "WITHIN_BUDGET",
      estimatedCost: supplier.price,
      budget: requirement.budget,

      explanation:
        "Supplier's quoted total price is within the client's total budget.",
    };
  }

  return {
    status: "OVER_BUDGET",
    estimatedCost: supplier.price,
    budget: requirement.budget,

    explanation:
      "Supplier's quoted total price exceeds the client's total budget.",
  };
};
