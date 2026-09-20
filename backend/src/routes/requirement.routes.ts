import { Router } from "express";

import { createRequirementController } from "../controllers/requirement.controller";

import { validate } from "../middleware/validate";
import { validateCreateRequirement } from "../middleware/requirement.validation";

const router = Router();

router.post(
  "/clients/:clientId/requirements",
  validate(validateCreateRequirement),
  createRequirementController,
);

export default router;
