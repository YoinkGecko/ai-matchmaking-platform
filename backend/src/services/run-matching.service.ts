import { findSimilarOfferings } from "./matching.service";
import { evaluateMatchCandidate } from "./match-candidate.service";
import { getMatchesForRequirement, saveMatch } from "./match.service";
import { notifyMatchResults } from "./match-notification.service";

export const runMatching = async (requirementId: string) => {
  const offerings = await findSimilarOfferings(requirementId, 20);

  const savedMatches = [];

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

    const savedMatch = await saveMatch({
      requirementId,

      offeringId: candidate.offeringId,

      supplierId: candidate.supplierId,

      score: candidate.score.score,

      percentage: candidate.score.percentage,

      semanticScore: candidate.semanticScore,

      productDecision: candidate.product.decision,

      quantityCoverage: candidate.quantity.coverage,

      budgetStatus: candidate.budget.status,

      deliveryStatus: candidate.delivery.status,

      productReason: candidate.product.aiResult?.reason,

      budgetExplanation: candidate.budget.explanation,

      deliveryExplanation: candidate.delivery.explanation,
    });

    savedMatches.push(savedMatch);
  }

  await notifyMatchResults(requirementId, savedMatches);

  return getMatchesForRequirement(requirementId);
};
