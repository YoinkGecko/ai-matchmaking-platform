import { Router } from "express";

import {
  createClientController,
  getClientController,
  getMyClientProfileController,
  updateMyClientProfileController,
} from "../controllers/client.controller";

import { validate } from "../middleware/validate";
import { validateCreateClient } from "../middleware/client.validation";
import { validateUpdateClientProfile } from "../middleware/profile.validation";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post("/", validate(validateCreateClient), createClientController);

router.get(
  "/me/profile",
  authenticate,
  requireRole("CLIENT"),
  getMyClientProfileController,
);

router.patch(
  "/me/profile",
  authenticate,
  requireRole("CLIENT"),
  validate(validateUpdateClientProfile),
  updateMyClientProfileController,
);

router.get("/:id", getClientController);

export default router;
