import { evaluateMatchCandidate } from "../services/match-candidate.service";

const requirement = {
  productRequirement: "Food grade stainless steel containers",
  category: "Industrial Packaging",

  specifications: "Food grade, reusable",
  qualityGrade: "Food Grade",

  quantityRequired: 10000,
  unit: "pieces",

  budget: 500000,
  budgetType: "TOTAL" as const,

  requiredByDate: "2026-10-15",

  allowMultipleSuppliers: true,
};

const offering = {
  id: "offering-001",
  supplierId: "supplier-001",

  productOffered: "Stainless steel food containers",
  category: "Industrial Packaging",

  specifications: "Food grade stainless steel",
  qualityGrade: "Food Grade",

  availableQuantity: 7000,
  unit: "pieces",

  price: 350000,
  priceType: "TOTAL" as const,

  minimumDeliveryDays: 10,
  maximumDeliveryDays: 15,

  semanticScore: 0.87,
};

async function main() {
  const result = await evaluateMatchCandidate(requirement, offering);
  console.dir(result, { depth: null });
}

void main();
