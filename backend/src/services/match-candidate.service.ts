import { evaluateBudget } from "./budget-matching.service";
import { evaluateDelivery } from "./delivery-matching.service";
import { calculateQuantityCoverage } from "./quantity-matching.service";
import { evaluateProduct } from "./product-compatibility.service";

export interface MatchRequirement {
  productRequirement: string;
  category: string;
  specifications?: string | null;
  qualityGrade?: string | null;

  quantityRequired: number;
  unit: string;

  budget: number;
  budgetType: "TOTAL" | "PER_UNIT";

  requiredByDate: string | Date;

  allowMultipleSuppliers: boolean;
}

export interface MatchOffering {
  id: string;
  supplierId: string;

  productOffered: string;
  category: string;
  specifications?: string | null;
  qualityGrade?: string | null;

  availableQuantity: number;
  unit: string;

  price: number;
  priceType: "TOTAL" | "PER_UNIT";

  minimumDeliveryDays: number;
  maximumDeliveryDays: number;

  semanticScore: number;
}

export const evaluateMatchCandidate = async (
  requirement: MatchRequirement,
  offering: MatchOffering,
) => {
  // 1. Quantity
  const quantityCoverage = calculateQuantityCoverage(
    {
      requiredQuantity: requirement.quantityRequired,
      unit: requirement.unit,
    },
    {
      availableQuantity: offering.availableQuantity,
      unit: offering.unit,
    },
  );

  // 2. Budget
  const budgetResult = evaluateBudget(
    {
      budget: requirement.budget,
      budgetType: requirement.budgetType,
    },
    {
      price: offering.price,
      priceType: offering.priceType,
      availableQuantity: offering.availableQuantity,
    },
    requirement.quantityRequired,
  );

  // 3. Delivery
  const deliveryResult = evaluateDelivery(
    {
      requiredByDate: requirement.requiredByDate,
    },
    {
      minimumDeliveryDays: offering.minimumDeliveryDays,
      maximumDeliveryDays: offering.maximumDeliveryDays,
    },
  );

  // 4. Product compatibility
  const productResult = await evaluateProduct({
    semanticScore: offering.semanticScore,
    productSignal: 0,

    requirement: {
      productRequirement: requirement.productRequirement,
      category: requirement.category,
      specifications: requirement.specifications,
      qualityGrade: requirement.qualityGrade,
    },

    offering: {
      productOffered: offering.productOffered,
      category: offering.category,
      specifications: offering.specifications,
      qualityGrade: offering.qualityGrade,
    },
  });

  return {
    offeringId: offering.id,
    supplierId: offering.supplierId,

    semanticScore: offering.semanticScore,

    product: productResult,

    quantity: {
      coverage: quantityCoverage,
      availableQuantity: offering.availableQuantity,
      requiredQuantity: requirement.quantityRequired,
      compatibleUnit:
        requirement.unit.toLowerCase() === offering.unit.toLowerCase(),
    },

    budget: budgetResult,

    delivery: deliveryResult,
  };
};
