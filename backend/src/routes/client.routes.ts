import { Router } from "express";
import {
  createClientController,
  getClientController,
} from "../controllers/client.controller";

const router = Router();

router.post("/", createClientController);
router.get("/:id", getClientController);

export default router;
