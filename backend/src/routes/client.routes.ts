import { Router } from "express";

import {
  createClientController,
  getClientController,
} from "../controllers/client.controller";

import { validate } from "../middleware/validate";
import { validateCreateClient } from "../middleware/client.validation";

const router = Router();

router.post("/", validate(validateCreateClient), createClientController);

router.get("/:id", getClientController);

export default router;
