import { Router } from "express";

import {
  createRequirementController,
  getClientRequirementsController,
} from "../controllers/requirement.controller";

import { validate } from "../middleware/validate";
import { validateCreateRequirement } from "../middleware/requirement.validation";
import { validateClientId } from "../middleware/uuid.validation";

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

export default router;
