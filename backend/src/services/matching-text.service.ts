export interface RequirementForEmbedding {
  productRequirement: string;
  category: string;
  specifications?: string | null;
  qualityGrade?: string | null;
  additionalNotes?: string | null;
}

export interface OfferingForEmbedding {
  productOffered: string;
  category: string;
  specifications?: string | null;
  qualityGrade?: string | null;
  pricingNotes?: string | null;
  additionalNotes?: string | null;
}

export const buildRequirementText = (requirement: RequirementForEmbedding) => {
  return `
Product Requirement: ${requirement.productRequirement}
Category: ${requirement.category}
Specifications: ${requirement.specifications ?? "Not specified"}
Quality Grade: ${requirement.qualityGrade ?? "Not specified"}
Additional Notes: ${requirement.additionalNotes ?? "None"}
`.trim();
};

export const buildOfferingText = (offering: OfferingForEmbedding) => {
  return `
Product Offered: ${offering.productOffered}
Category: ${offering.category}
Specifications: ${offering.specifications ?? "Not specified"}
Quality Grade: ${offering.qualityGrade ?? "Not specified"}
Pricing Notes: ${offering.pricingNotes ?? "None"}
Additional Notes: ${offering.additionalNotes ?? "None"}
`.trim();
};
