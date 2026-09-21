const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (text: string): string[] => {
  return normalizeText(text).split(" ").filter(Boolean);
};

export const calculateProductSignal = (
  requiredProduct: string,
  requiredCategory: string,
  offeredProduct: string,
  offeredCategory: string,
): number => {
  const requiredProductNormalized = normalizeText(requiredProduct);

  const offeredProductNormalized = normalizeText(offeredProduct);

  const offeredCategoryNormalized = normalizeText(offeredCategory);

  // Exact product phrase.
  if (offeredProductNormalized === requiredProductNormalized) {
    return 1;
  }

  // Requested product appears as a complete phrase
  // in the supplier's product description.
  if (offeredProductNormalized.includes(requiredProductNormalized)) {
    return 0.9;
  }

  // Requested product appears in the supplier category.
  if (offeredCategoryNormalized.includes(requiredProductNormalized)) {
    return 0.85;
  }

  // Otherwise, do not claim product compatibility
  // merely because the category is related.
  return 0;
};
