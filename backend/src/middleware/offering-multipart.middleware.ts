import { Request, Response, NextFunction } from "express";

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/** Coerce multipart form fields to the shapes expected by offering validation. */
export function coerceOfferingMultipartBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.is("multipart/form-data")) {
    next();
    return;
  }

  const body = req.body as Record<string, unknown>;

  if (body.availableQuantity !== undefined) {
    body.availableQuantity = num(body.availableQuantity);
  }
  if (body.price !== undefined) {
    body.price = num(body.price);
  }
  if (body.minimumDeliveryDays !== undefined) {
    body.minimumDeliveryDays = num(body.minimumDeliveryDays);
  }
  if (body.maximumDeliveryDays !== undefined) {
    body.maximumDeliveryDays = num(body.maximumDeliveryDays);
  }

  next();
}
