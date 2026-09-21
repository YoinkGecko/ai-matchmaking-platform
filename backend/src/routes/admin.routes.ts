import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import {
  adminClientsController,
  adminMatchesController,
  adminOfferingsController,
  adminOverviewController,
  adminRequirementsController,
  adminSuppliersController,
  adminUsersController,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/overview", adminOverviewController);
router.get("/users", adminUsersController);
router.get("/clients", adminClientsController);
router.get("/suppliers", adminSuppliersController);
router.get("/requirements", adminRequirementsController);
router.get("/offerings", adminOfferingsController);
router.get("/matches", adminMatchesController);

export default router;
