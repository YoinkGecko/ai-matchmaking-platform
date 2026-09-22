import { Router } from "express";

import {
  createOfferingController,
  getSupplierOfferingsController,
  updateMyOfferingController,
} from "../controllers/offering.controller";

import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { validateSupplierId } from "../middleware/supplier.validation";
import { validateCreateOffering } from "../middleware/offering.validation";
import { validateOfferingId } from "../middleware/uuid.validation";
import {
  coerceOfferingJsonBody,
  coerceOfferingMultipartBody,
} from "../middleware/offering-multipart.middleware";
import { offeringPhotosUpload } from "../middleware/upload.middleware";
import { Request, Response, NextFunction } from "express";

const router = Router();

function handleOfferingPhotosUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  offeringPhotosUpload(req, res, (err: unknown) => {
    if (err) {
      const message =
        err instanceof Error ? err.message : "Photo upload failed";
      res.status(400).json({ success: false, message });
      return;
    }
    next();
  });
}

router.post(
  "/suppliers/:supplierId/offerings",
  validate(validateSupplierId),
  handleOfferingPhotosUpload,
  coerceOfferingMultipartBody,
  validate(validateCreateOffering),
  createOfferingController,
);

router.get(
  "/suppliers/:supplierId/offerings",
  validate(validateSupplierId),
  getSupplierOfferingsController,
);

router.patch(
  "/suppliers/me/offerings/:offeringId",
  authenticate,
  requireRole("SUPPLIER"),
  coerceOfferingJsonBody,
  validate(validateOfferingId),
  validate(validateCreateOffering),
  updateMyOfferingController,
);

export default router;
