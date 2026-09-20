import { Router } from "express";

import {
  createOfferingController,
  getSupplierOfferingsController,
} from "../controllers/offering.controller";

import { validate } from "../middleware/validate";
import { validateSupplierId } from "../middleware/supplier.validation";
import { validateCreateOffering } from "../middleware/offering.validation";

const router = Router();

router.post(
  "/suppliers/:supplierId/offerings",
  validate(validateSupplierId),
  validate(validateCreateOffering),
  createOfferingController,
);

router.get(
  "/suppliers/:supplierId/offerings",
  validate(validateSupplierId),
  getSupplierOfferingsController,
);

export default router;
