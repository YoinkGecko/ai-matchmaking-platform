import { Router } from "express";
import {
  getMyClientOrdersController,
  getMySupplierOrdersController,
  placeOrderController,
  respondToOrderController,
} from "../controllers/order.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/requirements/:requirementId/matches/:matchId/orders",
  authenticate,
  requireRole("CLIENT"),
  placeOrderController,
);

router.get(
  "/clients/me/orders",
  authenticate,
  requireRole("CLIENT"),
  getMyClientOrdersController,
);

router.get(
  "/suppliers/me/orders",
  authenticate,
  requireRole("SUPPLIER"),
  getMySupplierOrdersController,
);

router.patch(
  "/suppliers/me/orders/:orderId",
  authenticate,
  requireRole("SUPPLIER"),
  respondToOrderController,
);

export default router;
