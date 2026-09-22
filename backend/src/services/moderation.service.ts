import pool from "../db";
import { emailQueue } from "./email-queue.service";
import { UserRole } from "../middleware/auth.middleware";

async function assertMessageReportAccess(
  messageId: string,
  reporterEmail: string,
  reporterRole: "CLIENT" | "SUPPLIER",
) {
  const result = await pool.query(
    `
    SELECT
      m.id,
      m.body,
      m.sender_role,
      m.conversation_id,
      cl.email AS client_email,
      s.email AS supplier_email
    FROM offering_messages m
    JOIN offering_conversations c ON c.id = m.conversation_id
    JOIN clients cl ON cl.id = c.client_id
    JOIN suppliers s ON s.id = c.supplier_id
    WHERE m.id = $1
    `,
    [messageId],
  );

  if (result.rows.length === 0) {
    throw new Error("Message not found");
  }

  const row = result.rows[0];
  const normalized = reporterEmail.toLowerCase().trim();

  if (reporterRole === "CLIENT" && row.client_email !== normalized) {
    throw new Error("You do not have access to this message");
  }

  if (reporterRole === "SUPPLIER" && row.supplier_email !== normalized) {
    throw new Error("You do not have access to this message");
  }

  if (row.sender_role === reporterRole) {
    throw new Error("You cannot report your own message");
  }

  const reportedRole = row.sender_role as "CLIENT" | "SUPPLIER";
  const reportedEmail =
    reportedRole === "CLIENT" ? row.client_email : row.supplier_email;

  return {
    conversationId: row.conversation_id as string,
    messageBody: row.body as string,
    reportedRole,
    reportedEmail: reportedEmail as string,
  };
}

export async function reportChatMessage(
  messageId: string,
  reporterEmail: string,
  reporterRole: "CLIENT" | "SUPPLIER",
  reason?: string,
) {
  const ctx = await assertMessageReportAccess(
    messageId,
    reporterEmail,
    reporterRole,
  );

  const trimmedReason = reason?.trim() || null;

  try {
    const inserted = await pool.query(
      `
      INSERT INTO chat_message_reports (
        message_id,
        conversation_id,
        reporter_email,
        reporter_role,
        reported_email,
        reported_role,
        message_body,
        reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        messageId,
        ctx.conversationId,
        reporterEmail.toLowerCase().trim(),
        reporterRole,
        ctx.reportedEmail,
        ctx.reportedRole,
        ctx.messageBody,
        trimmedReason,
      ],
    );

    return inserted.rows[0];
  } catch (error: unknown) {
    const pgCode =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : "";
    if (pgCode === "23505") {
      throw new Error("You already reported this message");
    }
    throw error;
  }
}

export async function listChatReports(status?: string) {
  const params: string[] = [];
  let where = "";

  if (status) {
    params.push(status);
    where = `WHERE r.status = $1`;
  }

  const result = await pool.query(
    `
    SELECT
      r.*,
      o.product_offered,
      cl.company_name,
      s.supplier_name
    FROM chat_message_reports r
    JOIN offering_conversations c ON c.id = r.conversation_id
    JOIN offerings o ON o.id = c.offering_id
    JOIN clients cl ON cl.id = c.client_id
    JOIN suppliers s ON s.id = c.supplier_id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT 200
    `,
    params,
  );

  return result.rows;
}

export async function updateReportStatus(
  reportId: string,
  status: "REVIEWED" | "DISMISSED",
) {
  const result = await pool.query(
    `
    UPDATE chat_message_reports
    SET status = $2, reviewed_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [reportId, status],
  );

  return result.rows[0] ?? null;
}

export async function sendModerationWarning(
  targetEmail: string,
  targetRole: "CLIENT" | "SUPPLIER",
  warningMessage: string,
  adminEmail: string,
  relatedReportId?: string,
) {
  const normalized = targetEmail.toLowerCase().trim();
  const userResult = await pool.query(
    `SELECT id, email, role FROM users WHERE email = $1 AND role = $2`,
    [normalized, targetRole],
  );

  if (userResult.rows.length === 0) {
    throw new Error("User account not found for that email and role");
  }

  const user = userResult.rows[0];

  const profileResult = await pool.query(
    targetRole === "CLIENT"
      ? `SELECT contact_person FROM clients WHERE email = $1`
      : `SELECT contact_person FROM suppliers WHERE email = $1`,
    [normalized],
  );

  const contact = profileResult.rows[0]?.contact_person ?? "there";

  await pool.query(
    `
    INSERT INTO moderation_warnings (
      user_id,
      user_email,
      user_role,
      message,
      related_report_id,
      sent_by_admin_email
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      user.id,
      user.email,
      user.role,
      warningMessage.trim(),
      relatedReportId ?? null,
      adminEmail.toLowerCase().trim(),
    ],
  );

  await emailQueue.add("send-moderation-warning", {
    email: user.email,
    subject: "Wisdom Match — account warning",
    body: `Hi ${contact},

Our moderation team has issued a warning regarding your use of Wisdom Match:

${warningMessage.trim()}

Please keep all marketplace and chat communication professional and compliant with our policies. Repeated violations may lead to account suspension.

— Wisdom Match Trust & Safety`,
  });

  if (relatedReportId) {
    await updateReportStatus(relatedReportId, "REVIEWED");
  }

  return { userId: user.id, email: user.email, role: user.role };
}
