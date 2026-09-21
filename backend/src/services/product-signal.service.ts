function normalizeCategory(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "kg",
  "per",
  "unit",
  "grade",
  "premium",
  "quality",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Heuristic 0–1 signal used before the LLM gate in product-decision.service.
 * Same category + overlapping product terms → allow scoring / LLM.
 * Different category (e.g. Industrial vs Food) → 0 → hard reject when similarity is weak.
 */
export function computeProductSignal(
  requirement: { category: string; productRequirement: string },
  offering: { category: string; productOffered: string },
): number {
  const reqCat = normalizeCategory(requirement.category);
  const offCat = normalizeCategory(offering.category);

  if (reqCat !== offCat) {
    return 0;
  }

  const reqText = requirement.productRequirement.toLowerCase().trim();
  const offText = offering.productOffered.toLowerCase().trim();

  if (reqText === offText) {
    return 1;
  }

  const reqTokens = tokenize(reqText);
  const offTokenSet = new Set(tokenize(offText));

  if (reqTokens.length === 0) {
    return 0.85;
  }

  let overlap = 0;
  for (const token of reqTokens) {
    if (offTokenSet.has(token)) overlap++;
  }

  const overlapRatio = overlap / reqTokens.length;

  if (overlapRatio >= 0.5) {
    return 1;
  }

  if (overlapRatio >= 0.25 || offText.includes(reqTokens[0])) {
    return 0.9;
  }

  return 0.85;
}
