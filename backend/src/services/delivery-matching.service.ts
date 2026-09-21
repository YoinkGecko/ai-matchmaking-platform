export type DeliveryMatchStatus = "ON_TIME" | "LATE" | "UNCERTAIN";

export interface DeliveryRequirement {
  requiredByDate: string | Date;
}

export interface SupplierDelivery {
  minimumDeliveryDays: number;
  maximumDeliveryDays: number;
}

export interface DeliveryMatchResult {
  status: DeliveryMatchStatus;
  earliestDeliveryDate: string;
  latestDeliveryDate: string;
  requiredByDate: string;
  explanation: string;
}

export const evaluateDelivery = (
  requirement: DeliveryRequirement,
  supplier: SupplierDelivery,
  fromDate: Date = new Date(),
): DeliveryMatchResult => {
  const requiredByDate = new Date(requirement.requiredByDate);

  const earliestDeliveryDate = new Date(fromDate);

  earliestDeliveryDate.setDate(
    earliestDeliveryDate.getDate() + supplier.minimumDeliveryDays,
  );

  const latestDeliveryDate = new Date(fromDate);

  latestDeliveryDate.setDate(
    latestDeliveryDate.getDate() + supplier.maximumDeliveryDays,
  );

  // Supplier can definitely deliver before deadline
  if (latestDeliveryDate <= requiredByDate) {
    return {
      status: "ON_TIME",
      earliestDeliveryDate: earliestDeliveryDate.toISOString(),
      latestDeliveryDate: latestDeliveryDate.toISOString(),
      requiredByDate: requiredByDate.toISOString(),

      explanation:
        "Supplier's maximum delivery time is within the client's required deadline.",
    };
  }

  // Even the earliest possible delivery is after deadline
  if (earliestDeliveryDate > requiredByDate) {
    return {
      status: "LATE",
      earliestDeliveryDate: earliestDeliveryDate.toISOString(),
      latestDeliveryDate: latestDeliveryDate.toISOString(),
      requiredByDate: requiredByDate.toISOString(),

      explanation:
        "Supplier cannot deliver before the client's required deadline.",
    };
  }

  // Earliest is before deadline, latest is after
  return {
    status: "UNCERTAIN",
    earliestDeliveryDate: earliestDeliveryDate.toISOString(),
    latestDeliveryDate: latestDeliveryDate.toISOString(),
    requiredByDate: requiredByDate.toISOString(),

    explanation:
      "Supplier may meet the deadline, but the delivery window extends beyond it.",
  };
};
