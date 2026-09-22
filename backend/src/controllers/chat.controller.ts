import { Request, Response } from "express";
import { AuthPayload } from "../middleware/auth.middleware";
import {
  getConversationThread,
  getOfferingChatForClient,
  listClientConversations,
  listSupplierConversations,
  sendMessage,
  sendOfferingMessageAsClient,
} from "../services/chat.service";

export const getOfferingChatController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { offeringId } = req.params;
    const data = await getOfferingChatForClient(user.email, offeringId as string);
    res.json({ success: true, ...data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load chat";
    res.status(400).json({ success: false, message });
  }
};

export const postOfferingChatMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { offeringId } = req.params;
    const { message } = req.body ?? {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const created = await sendOfferingMessageAsClient(
      user.email,
      offeringId as string,
      String(message),
    );

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message";
    res.status(400).json({ success: false, message });
  }
};

export const getConversationController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as AuthPayload;
    if (user.role !== "CLIENT" && user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { conversationId } = req.params;
    const data = await getConversationThread(
      conversationId as string,
      user.email,
      user.role,
    );
    res.json({ success: true, ...data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load conversation";
    const status = message.includes("not found") || message.includes("access")
      ? 404
      : 400;
    res.status(status).json({ success: false, message });
  }
};

export const postConversationMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { conversationId } = req.params;
    const { message } = req.body ?? {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    if (user.role !== "CLIENT" && user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const created = await sendMessage(
      conversationId as string,
      user.email,
      user.role as "CLIENT" | "SUPPLIER",
      String(message),
    );

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message";
    const status = message.includes("not found") || message.includes("access")
      ? 404
      : 400;
    res.status(status).json({ success: false, message });
  }
};

export const listMyClientChatsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const data = await listClientConversations(user.email);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load chats" });
  }
};

export const listMySupplierChatsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const data = await listSupplierConversations(user.email);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load chats" });
  }
};
