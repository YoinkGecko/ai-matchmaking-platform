import { Router } from "express";
import {
  getConversationController,
  getOfferingChatController,
  listMyClientChatsController,
  listMySupplierChatsController,
  postConversationMessageController,
  postOfferingChatMessageController,
} from "../controllers/chat.controller";
import { reportChatMessageController } from "../controllers/moderation.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/clients/me/chats",
  authenticate,
  requireRole("CLIENT"),
  listMyClientChatsController,
);

router.get(
  "/suppliers/me/chats",
  authenticate,
  requireRole("SUPPLIER"),
  listMySupplierChatsController,
);

router.get(
  "/offerings/:offeringId",
  authenticate,
  requireRole("CLIENT"),
  getOfferingChatController,
);

router.post(
  "/offerings/:offeringId/messages",
  authenticate,
  requireRole("CLIENT"),
  postOfferingChatMessageController,
);

router.get(
  "/conversations/:conversationId",
  authenticate,
  getConversationController,
);

router.post(
  "/conversations/:conversationId/messages",
  authenticate,
  postConversationMessageController,
);

router.post(
  "/messages/:messageId/report",
  authenticate,
  reportChatMessageController,
);

export default router;
