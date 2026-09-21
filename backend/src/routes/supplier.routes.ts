import { Router } from "express";

import {
  createSupplierController,
  getSupplierController,
  getMySupplierProfileController,
  updateMySupplierProfileController,
} from "../controllers/supplier.controller";

import { validate } from "../middleware/validate";
import { validateUpdateSupplierProfile } from "../middleware/profile.validation";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createSupplierController);

router.get(
  "/me/profile",
  authenticate,
  requireRole("SUPPLIER"),
  getMySupplierProfileController,
);

router.patch(
  "/me/profile",
  authenticate,
  requireRole("SUPPLIER"),
  validate(validateUpdateSupplierProfile),
  updateMySupplierProfileController,
);

router.get("/:id", getSupplierController);

export default router;
