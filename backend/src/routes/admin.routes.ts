import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import {
  adminClientsController,
  adminMatchesController,
  adminOrdersController,
  adminOfferingsController,
  adminOverviewController,
  adminRequirementsController,
  adminSuppliersController,
  adminUsersController,
} from "../controllers/admin.controller";
import {
  adminDismissReportController,
  adminListReportsController,
  adminSendWarningController,
  adminSetUserStatusController,
} from "../controllers/moderation.controller";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/overview", adminOverviewController);
router.get("/users", adminUsersController);
router.get("/clients", adminClientsController);
router.get("/suppliers", adminSuppliersController);
router.get("/requirements", adminRequirementsController);
router.get("/offerings", adminOfferingsController);
router.get("/matches", adminMatchesController);
router.get("/orders", adminOrdersController);
router.get("/reports", adminListReportsController);
router.post("/warnings", adminSendWarningController);
router.patch("/reports/:reportId/dismiss", adminDismissReportController);
router.patch("/users/:userId/status", adminSetUserStatusController);

export default router;
