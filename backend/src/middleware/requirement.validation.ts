import { Request } from "express";

export const validateCreateRequirement = (req: Request) => {
  const errors: Record<string, string> = {};

  const {
    productRequirement,
    category,
    quantityRequired,
    unit,
    specifications,
    qualityGrade,
    additionalNotes,
    budget,
    currency,
    budgetType,
    deliveryLocation,
    requiredByDate,
  } = req.body;

  if (
    typeof productRequirement !== "string" ||
    productRequirement.trim().length === 0
  ) {
    errors.productRequirement = "Product requirement is required";
  }

  if (typeof category !== "string" || category.trim().length === 0) {
    errors.category = "Category is required";
  }

  if (typeof quantityRequired !== "number" || quantityRequired <= 0) {
    errors.quantityRequired = "Quantity must be a number greater than 0";
  }

  if (typeof unit !== "string" || unit.trim().length === 0) {
    errors.unit = "Unit is required";
  }

  if (typeof budget !== "number" || budget < 0) {
    errors.budget = "Budget must be a number greater than or equal to 0";
  }

  if (currency !== undefined && typeof currency !== "string") {
    errors.currency = "Currency must be a string";
  }

  if (budgetType !== "TOTAL" && budgetType !== "PER_UNIT") {
    errors.budgetType = "Budget type must be TOTAL or PER_UNIT";
  }

  if (
    typeof deliveryLocation !== "string" ||
    deliveryLocation.trim().length === 0
  ) {
    errors.deliveryLocation = "Delivery location is required";
  }

  if (
    typeof requiredByDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(requiredByDate)
  ) {
    errors.requiredByDate = "Required by date must use YYYY-MM-DD format";
  }

  return errors;
};
