import { OfferingForEmbedding, buildOfferingText } from "./matching-text.service";
import { UpdateOfferingInput } from "./offering.service";

export function offeringSemanticFieldsChanged(
  existing: Record<string, unknown>,
  data: UpdateOfferingInput,
): boolean {
  const norm = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

  return (
    norm(existing.product_offered) !== norm(data.productOffered) ||
    norm(existing.category) !== norm(data.category) ||
    norm(existing.specifications) !== norm(data.specifications) ||
    norm(existing.quality_grade) !== norm(data.qualityGrade) ||
    norm(existing.pricing_notes) !== norm(data.pricingNotes) ||
    norm(existing.additional_notes) !== norm(data.additionalNotes)
  );
}

export function offeringEmbeddingPayload(
  data: UpdateOfferingInput,
): OfferingForEmbedding {
  return {
    productOffered: data.productOffered,
    category: data.category,
    specifications: data.specifications,
    qualityGrade: data.qualityGrade,
    pricingNotes: data.pricingNotes,
    additionalNotes: data.additionalNotes,
  };
}

export function offeringEmbeddingText(data: UpdateOfferingInput): string {
  return buildOfferingText(offeringEmbeddingPayload(data));
}
