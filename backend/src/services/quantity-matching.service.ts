export interface QuantityRequirement {
  requiredQuantity: number;
  unit: string;
}

export interface QuantityOffering {
  availableQuantity: number;
  unit: string;
}

export const calculateQuantityCoverage = (
  requirement: QuantityRequirement,
  offering: QuantityOffering,
): number => {
  if (requirement.unit.toLowerCase() !== offering.unit.toLowerCase()) {
    return 0;
  }

  if (requirement.requiredQuantity <= 0) {
    return 0;
  }

  const suppliedQuantity = Math.min(
    offering.availableQuantity,
    requirement.requiredQuantity,
  );

  return suppliedQuantity / requirement.requiredQuantity;
};

export interface SupplierQuantity {
  supplierId: string;
  availableQuantity: number;
  unit: string;
}

export const calculateCombinedQuantity = (
  requirement: QuantityRequirement,
  offerings: SupplierQuantity[],
) => {
  const compatibleOfferings = offerings.filter(
    (offering) =>
      offering.unit.toLowerCase() === requirement.unit.toLowerCase(),
  );

  const totalAvailable = compatibleOfferings.reduce(
    (total, offering) => total + offering.availableQuantity,
    0,
  );

  const fulfilledQuantity = Math.min(
    totalAvailable,
    requirement.requiredQuantity,
  );

  const coverage = fulfilledQuantity / requirement.requiredQuantity;

  return {
    fulfilledQuantity,
    coverage,
    fullyFulfilled: fulfilledQuantity >= requirement.requiredQuantity,
  };
};
