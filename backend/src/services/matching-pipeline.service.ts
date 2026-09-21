import { findSimilarOfferings } from "./matching.service";
import { evaluateMatchCandidate } from "./match-candidate.service";

export const generateMatchCandidates = async (requirementId: string) => {
  const offerings = await findSimilarOfferings(requirementId, 20);

  const candidates = [];

  for (const offering of offerings) {
    const candidate = await evaluateMatchCandidate(
      {
        productRequirement: offering.product_requirement,
        category: offering.requirement_category,
        specifications: offering.requirement_specifications,
        qualityGrade: offering.requirement_quality_grade,

        quantityRequired: Number(offering.quantity_required),
        unit: offering.requirement_unit,

        budget: Number(offering.requirement_budget),
        budgetType: offering.requirement_budget_type,

        requiredByDate: offering.required_by_date,

        allowMultipleSuppliers: offering.allow_multiple_suppliers,
      },
      {
        id: offering.id,
        supplierId: offering.supplier_id,

        productOffered: offering.product_offered,
        category: offering.category,
        specifications: offering.specifications,
        qualityGrade: offering.quality_grade,

        availableQuantity: Number(offering.available_quantity),
        unit: offering.unit,

        price: Number(offering.price),
        priceType: offering.price_type,

        minimumDeliveryDays: offering.minimum_delivery_days,

        maximumDeliveryDays: offering.maximum_delivery_days,

        semanticScore: Number(offering.semantic_score),
      },
    );

    candidates.push(candidate);
  }

  return candidates;
};
