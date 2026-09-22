import pool from "../db";
import { notifyChatMessage } from "./chat-notification.service";

async function getClientIdByEmail(email: string) {
  const result = await pool.query(`SELECT id FROM clients WHERE email = $1`, [
    email.toLowerCase().trim(),
  ]);
  return result.rows[0]?.id as string | undefined;
}

async function getSupplierIdByEmail(email: string) {
  const result = await pool.query(`SELECT id FROM suppliers WHERE email = $1`, [
    email.toLowerCase().trim(),
  ]);
  return result.rows[0]?.id as string | undefined;
}

export async function getOrCreateConversationForOffering(
  clientEmail: string,
  offeringId: string,
) {
  const clientId = await getClientIdByEmail(clientEmail);
  if (!clientId) {
    throw new Error("Client profile not found");
  }

  const offeringResult = await pool.query(
    `SELECT id, supplier_id FROM offerings WHERE id = $1`,
    [offeringId],
  );

  if (offeringResult.rows.length === 0) {
    throw new Error("Offering not found");
  }

  const supplierId = offeringResult.rows[0].supplier_id as string;

  const existing = await pool.query(
    `
    SELECT * FROM offering_conversations
    WHERE offering_id = $1 AND client_id = $2
    `,
    [offeringId, clientId],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const inserted = await pool.query(
    `
    INSERT INTO offering_conversations (offering_id, client_id, supplier_id)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [offeringId, clientId, supplierId],
  );

  return inserted.rows[0];
}

async function assertConversationAccess(
  conversationId: string,
  email: string,
  role: "CLIENT" | "SUPPLIER",
) {
  const result = await pool.query(
    `
    SELECT c.*, cl.email AS client_email, s.email AS supplier_email
    FROM offering_conversations c
    JOIN clients cl ON cl.id = c.client_id
    JOIN suppliers s ON s.id = c.supplier_id
    WHERE c.id = $1
    `,
    [conversationId],
  );

  if (result.rows.length === 0) {
    throw new Error("Conversation not found");
  }

  const row = result.rows[0];
  const normalized = email.toLowerCase().trim();

  if (role === "CLIENT" && row.client_email !== normalized) {
    throw new Error("You do not have access to this conversation");
  }

  if (role === "SUPPLIER" && row.supplier_email !== normalized) {
    throw new Error("You do not have access to this conversation");
  }

  return row;
}

export async function getConversationThread(
  conversationId: string,
  email: string,
  role: "CLIENT" | "SUPPLIER",
) {
  await assertConversationAccess(conversationId, email, role);

  const meta = await pool.query(
    `
    SELECT
      c.*,
      o.product_offered,
      o.fulfillment_location,
      cl.company_name,
      cl.contact_person AS client_contact,
      cl.email AS client_email,
      s.supplier_name,
      s.contact_person AS supplier_contact,
      s.email AS supplier_email
    FROM offering_conversations c
    JOIN offerings o ON o.id = c.offering_id
    JOIN clients cl ON cl.id = c.client_id
    JOIN suppliers s ON s.id = c.supplier_id
    WHERE c.id = $1
    `,
    [conversationId],
  );

  const messages = await pool.query(
    `
    SELECT id, conversation_id, sender_role, body, created_at
    FROM offering_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    `,
    [conversationId],
  );

  return {
    conversation: meta.rows[0],
    messages: messages.rows,
  };
}

export async function getOfferingChatForClient(
  clientEmail: string,
  offeringId: string,
) {
  const conversation = await getOrCreateConversationForOffering(
    clientEmail,
    offeringId,
  );

  return getConversationThread(
    conversation.id,
    clientEmail,
    "CLIENT",
  );
}

export async function sendMessage(
  conversationId: string,
  email: string,
  role: "CLIENT" | "SUPPLIER",
  body: string,
) {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }

  await assertConversationAccess(conversationId, email, role);

  const inserted = await pool.query(
    `
    INSERT INTO offering_messages (conversation_id, sender_role, body)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [conversationId, role, trimmed],
  );

  await pool.query(
    `UPDATE offering_conversations SET updated_at = NOW() WHERE id = $1`,
    [conversationId],
  );

  await notifyChatMessage(conversationId, trimmed, role);

  return inserted.rows[0];
}

export async function sendOfferingMessageAsClient(
  clientEmail: string,
  offeringId: string,
  body: string,
) {
  const conversation = await getOrCreateConversationForOffering(
    clientEmail,
    offeringId,
  );

  return sendMessage(conversation.id, clientEmail, "CLIENT", body);
}

export async function listClientConversations(clientEmail: string) {
  const clientId = await getClientIdByEmail(clientEmail);
  if (!clientId) {
    throw new Error("Client profile not found");
  }

  const result = await pool.query(
    `
    SELECT
      c.id,
      c.offering_id,
      c.updated_at,
      o.product_offered,
      s.supplier_name,
      (
        SELECT body FROM offering_messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT created_at FROM offering_messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message_at
    FROM offering_conversations c
    JOIN offerings o ON o.id = c.offering_id
    JOIN suppliers s ON s.id = c.supplier_id
    WHERE c.client_id = $1
    ORDER BY c.updated_at DESC
    `,
    [clientId],
  );

  return result.rows;
}

export async function listSupplierConversations(supplierEmail: string) {
  const supplierId = await getSupplierIdByEmail(supplierEmail);
  if (!supplierId) {
    throw new Error("Supplier profile not found");
  }

  const result = await pool.query(
    `
    SELECT
      c.id,
      c.offering_id,
      c.updated_at,
      o.product_offered,
      cl.company_name,
      (
        SELECT body FROM offering_messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT created_at FROM offering_messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message_at
    FROM offering_conversations c
    JOIN offerings o ON o.id = c.offering_id
    JOIN clients cl ON cl.id = c.client_id
    WHERE c.supplier_id = $1
    ORDER BY c.updated_at DESC
    `,
    [supplierId],
  );

  return result.rows;
}
