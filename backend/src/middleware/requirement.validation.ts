import { Request, Response, NextFunction } from "express";

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/** Coerce JSON number fields before requirement validation. */
export function coerceRequirementJsonBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as Record<string, unknown>;
  if (body.quantityRequired !== undefined) {
    body.quantityRequired = num(body.quantityRequired);
  }
  if (body.budget !== undefined) {
    body.budget = num(body.budget);
  }
  next();
}

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
    allowMultipleSuppliers,
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

  if (typeof allowMultipleSuppliers !== "boolean") {
    errors.allowMultipleSuppliers = "allowMultipleSuppliers must be a boolean";
  }

  return errors;
};
