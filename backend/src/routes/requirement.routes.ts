import { Router } from "express";

import {
  createRequirementController,
  getClientRequirementsController,
  updateMyRequirementController,
} from "../controllers/requirement.controller";

import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  coerceRequirementJsonBody,
  validateCreateRequirement,
} from "../middleware/requirement.validation";
import {
  validateClientId,
  validateRequirementId,
} from "../middleware/uuid.validation";

const router = Router();

router.post(
  "/clients/:clientId/requirements",
  validate(validateClientId),
  validate(validateCreateRequirement),
  createRequirementController,
);

router.get(
  "/clients/:clientId/requirements",
  validate(validateClientId),
  getClientRequirementsController,
);

router.patch(
  "/clients/me/requirements/:requirementId",
  authenticate,
  requireRole("CLIENT"),
  coerceRequirementJsonBody,
  validate(validateRequirementId),
  validate(validateCreateRequirement),
  updateMyRequirementController,
);

export default router;
