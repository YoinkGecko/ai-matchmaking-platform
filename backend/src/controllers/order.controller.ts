import { Request, Response } from "express";
import { AuthPayload } from "../middleware/auth.middleware";
import {
  getOrdersForClientEmail,
  getOrdersForSupplierEmail,
  placeOrder,
  respondToOrder,
} from "../services/order.service";

export const placeOrderController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { requirementId, matchId } = req.params;
    const { quantityOrdered, clientNotes } = req.body ?? {};

    if (quantityOrdered == null || Number(quantityOrdered) <= 0) {
      return res.status(400).json({
        message: "quantityOrdered is required and must be greater than zero",
      });
    }

    const order = await placeOrder({
      clientEmail: user.email,
      requirementId: requirementId as string,
      matchId: matchId as string,
      quantityOrdered: Number(quantityOrdered),
      clientNotes: clientNotes ? String(clientNotes) : undefined,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to place order";

    const status =
      message.includes("not found") || message.includes("access")
        ? 404
        : message.includes("already")
          ? 409
          : 400;

    res.status(status).json({ success: false, message });
  }
};

export const getMyClientOrdersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const orders = await getOrdersForClientEmail(user.email);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

export const getMySupplierOrdersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const orders = await getOrdersForSupplierEmail(user.email);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

export const respondToOrderController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { orderId } = req.params;
    const { status, supplierResponseNotes } = req.body ?? {};

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      return res.status(400).json({
        message: "status must be ACCEPTED or REJECTED",
      });
    }

    const order = await respondToOrder({
      supplierEmail: user.email,
      orderId: orderId as string,
      status,
      supplierResponseNotes: supplierResponseNotes
        ? String(supplierResponseNotes)
        : undefined,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";

    const code =
      message.includes("not found") || message.includes("access")
        ? 404
        : message.includes("already")
          ? 409
          : 400;

    res.status(code).json({ success: false, message });
  }
};
