import { Request } from "express";

export const validateSupplierId = (req: Request) => {
  const errors: Record<string, string> = {};

  const { supplierId } = req.params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(supplierId as string)) {
    errors.supplierId = "Invalid supplier ID";
  }

  return errors;
};
