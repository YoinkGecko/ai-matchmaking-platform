import { Request } from "express";

export const validateCreateOffering = (req: Request) => {
  const errors: Record<string, string> = {};

  const {
    productOffered,
    category,
    availableQuantity,
    unit,
    price,
    currency,
    priceType,
    fulfillmentLocation,
    minimumDeliveryDays,
    maximumDeliveryDays,
  } = req.body;

  if (
    typeof productOffered !== "string" ||
    productOffered.trim().length === 0
  ) {
    errors.productOffered = "Product offered is required";
  }

  if (typeof category !== "string" || category.trim().length === 0) {
    errors.category = "Category is required";
  }

  if (typeof availableQuantity !== "number" || availableQuantity <= 0) {
    errors.availableQuantity = "Available quantity must be greater than 0";
  }

  if (typeof unit !== "string" || unit.trim().length === 0) {
    errors.unit = "Unit is required";
  }

  if (typeof price !== "number" || price < 0) {
    errors.price = "Price must be greater than or equal to 0";
  }

  if (typeof currency !== "string" || currency.trim().length === 0) {
    errors.currency = "Currency is required";
  }

  if (priceType !== "TOTAL" && priceType !== "PER_UNIT") {
    errors.priceType = "Price type must be TOTAL or PER_UNIT";
  }

  if (
    typeof fulfillmentLocation !== "string" ||
    fulfillmentLocation.trim().length === 0
  ) {
    errors.fulfillmentLocation = "Fulfillment location is required";
  }

  if (typeof minimumDeliveryDays !== "number" || minimumDeliveryDays < 0) {
    errors.minimumDeliveryDays = "Minimum delivery days must be 0 or greater";
  }

  if (typeof maximumDeliveryDays !== "number" || maximumDeliveryDays < 0) {
    errors.maximumDeliveryDays = "Maximum delivery days must be 0 or greater";
  }

  if (
    typeof minimumDeliveryDays === "number" &&
    typeof maximumDeliveryDays === "number" &&
    maximumDeliveryDays < minimumDeliveryDays
  ) {
    errors.maximumDeliveryDays =
      "Maximum delivery days cannot be less than minimum delivery days";
  }

  return errors;
};
