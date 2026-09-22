import { Router } from "express";
import { marketplaceOfferingsController } from "../controllers/marketplace.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/offerings",
  authenticate,
  requireRole("CLIENT"),
  marketplaceOfferingsController,
);

export default router;
