const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const calculateProductSignal = (
  requiredProduct: string,
  requiredCategory: string,
  offeredProduct: string,
  offeredCategory: string,
): number => {
  const required = normalizeText(requiredProduct);
  const requiredCategoryText = normalizeText(requiredCategory);

  const offered = normalizeText(`${offeredProduct} ${offeredCategory}`);

  // Direct product phrase match
  if (offered.includes(required)) {
    return 1;
  }

  // Individual meaningful words from the requested product
  const productWords = required.split(" ").filter((word) => word.length >= 3);

  if (productWords.length === 0) {
    return 0;
  }

  const matchedWords = productWords.filter((word) => offered.includes(word));

  const productWordScore = matchedWords.length / productWords.length;

  // Category relationship
  const categoryWords = requiredCategoryText
    .split(" ")
    .filter((word) => word.length >= 3);

  const matchedCategoryWords = categoryWords.filter((word) =>
    offered.includes(word),
  );

  const categoryScore =
    categoryWords.length === 0
      ? 0
      : matchedCategoryWords.length / categoryWords.length;

  return Math.max(productWordScore, categoryScore * 0.5);
};
