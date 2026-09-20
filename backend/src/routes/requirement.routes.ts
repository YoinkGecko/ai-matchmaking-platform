import { Router } from "express";
import {
  createRequirementController,
} from "../controllers/requirement.controller";

const router = Router();

router.post(
  "/clients/:clientId/requirements",
  createRequirementController
);

export default router;