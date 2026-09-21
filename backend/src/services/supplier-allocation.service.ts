export interface AllocationRequirement {
  requiredQuantity: number;
  unit: string;
  allowMultipleSuppliers: boolean;
}

export interface AllocationOffering {
  supplierId: string;
  offeringId: string;

  availableQuantity: number;
  unit: string;

  semanticScore: number;
}

export interface AllocationItem {
  supplierId: string;
  offeringId: string;
  allocatedQuantity: number;
}

export const allocateSuppliers = (
  requirement: AllocationRequirement,
  offerings: AllocationOffering[],
): {
  allocations: AllocationItem[];
  fulfilledQuantity: number;
  fullyFulfilled: boolean;
} => {
  // Only compatible units
  const compatibleOfferings = offerings.filter(
    (offering) =>
      offering.unit.toLowerCase() === requirement.unit.toLowerCase(),
  );

  // Single-supplier mode
  if (!requirement.allowMultipleSuppliers) {
    const offering = compatibleOfferings.find(
      (offering) => offering.availableQuantity >= requirement.requiredQuantity,
    );

    if (!offering) {
      return {
        allocations: [],
        fulfilledQuantity: 0,
        fullyFulfilled: false,
      };
    }

    return {
      allocations: [
        {
          supplierId: offering.supplierId,
          offeringId: offering.offeringId,
          allocatedQuantity: requirement.requiredQuantity,
        },
      ],
      fulfilledQuantity: requirement.requiredQuantity,
      fullyFulfilled: true,
    };
  }

  // Multiple suppliers allowed
  let remainingQuantity = requirement.requiredQuantity;

  const allocations: AllocationItem[] = [];

  const sortedOfferings = [...compatibleOfferings].sort(
    (a, b) => b.semanticScore - a.semanticScore,
  );

  for (const offering of sortedOfferings) {
    if (remainingQuantity <= 0) {
      break;
    }

    const allocatedQuantity = Math.min(
      offering.availableQuantity,
      remainingQuantity,
    );

    allocations.push({
      supplierId: offering.supplierId,
      offeringId: offering.offeringId,
      allocatedQuantity,
    });

    remainingQuantity -= allocatedQuantity;
  }

  const fulfilledQuantity = requirement.requiredQuantity - remainingQuantity;

  return {
    allocations,
    fulfilledQuantity,
    fullyFulfilled: fulfilledQuantity >= requirement.requiredQuantity,
  };
};
