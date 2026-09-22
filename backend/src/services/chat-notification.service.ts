import pool from "../db";
import { emailQueue } from "./email-queue.service";

export async function notifyChatMessage(
  conversationId: string,
  messageBody: string,
  senderRole: "CLIENT" | "SUPPLIER",
) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      cl.company_name,
      cl.contact_person AS client_contact,
      cl.email AS client_email,
      s.supplier_name,
      s.contact_person AS supplier_contact,
      s.email AS supplier_email,
      o.product_offered
    FROM offering_conversations c
    JOIN clients cl ON cl.id = c.client_id
    JOIN suppliers s ON s.id = c.supplier_id
    JOIN offerings o ON o.id = c.offering_id
    WHERE c.id = $1
    `,
    [conversationId],
  );

  if (result.rows.length === 0) {
    return;
  }

  const row = result.rows[0];
  const preview =
    messageBody.length > 280 ? `${messageBody.slice(0, 280)}…` : messageBody;

  if (senderRole === "CLIENT") {
    await emailQueue.add("send-chat-notification", {
      email: row.supplier_email,
      subject: `New message from ${row.company_name} — ${row.product_offered}`,
      body: `Hi ${row.supplier_contact},

${row.company_name} sent you a message about your offering "${row.product_offered}":

"${preview}"

Sign in to your Wisdom Match supplier dashboard to reply and negotiate.

— Wisdom Match`,
    });
  } else {
    await emailQueue.add("send-chat-notification", {
      email: row.client_email,
      subject: `Reply from ${row.supplier_name} — ${row.product_offered}`,
      body: `Hi ${row.client_contact},

${row.supplier_name} replied regarding "${row.product_offered}":

"${preview}"

Open the Marketplace tab in your client dashboard to continue the conversation.

— Wisdom Match`,
    });
  }
}
