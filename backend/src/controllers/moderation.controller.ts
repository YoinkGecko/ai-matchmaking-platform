import { Request, Response } from "express";
import { AuthPayload } from "../middleware/auth.middleware";
import { setUserAccountStatus } from "../services/account-status.service";
import {
  listChatReports,
  reportChatMessage,
  sendModerationWarning,
  updateReportStatus,
} from "../services/moderation.service";

export const reportChatMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;

    if (user.role !== "CLIENT" && user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { messageId } = req.params;
    const { reason } = req.body ?? {};

    const report = await reportChatMessage(
      messageId as string,
      user.email,
      user.role as "CLIENT" | "SUPPLIER",
      reason ? String(reason) : undefined,
    );

    res.status(201).json({
      success: true,
      data: report,
      message: "Report submitted. Our team will review it.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit report";
    res.status(400).json({ success: false, message });
  }
};

export const adminListReportsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const data = await listChatReports(status);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load reports" });
  }
};

export const adminDismissReportController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { reportId } = req.params;
    const updated = await updateReportStatus(reportId as string, "DISMISSED");
    if (!updated) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update report" });
  }
};

export const adminSendWarningController = async (req: Request, res: Response) => {
  try {
    const admin = res.locals.user as AuthPayload;
    const { email, role, message, reportId } = req.body ?? {};

    if (!email || !role || !message) {
      return res.status(400).json({
        success: false,
        message: "email, role, and message are required",
      });
    }

    if (role !== "CLIENT" && role !== "SUPPLIER") {
      return res.status(400).json({
        success: false,
        message: "role must be CLIENT or SUPPLIER",
      });
    }

    const result = await sendModerationWarning(
      String(email),
      role,
      String(message),
      admin.email,
      reportId ? String(reportId) : undefined,
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to send warning";
    res.status(400).json({ success: false, message: msg });
  }
};

export const adminSetUserStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body ?? {};

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return res.status(400).json({
        success: false,
        message: "status must be ACTIVE or SUSPENDED",
      });
    }

    const updated = await setUserAccountStatus(userId as string, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};
