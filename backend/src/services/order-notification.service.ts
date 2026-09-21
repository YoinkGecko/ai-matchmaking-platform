import pool from "../db";
import { emailQueue } from "./email-queue.service";

export async function notifyOrderPlaced(orderId: string) {
  const result = await pool.query(
    `
    SELECT
      o.id,
      o.quantity_ordered,
      o.unit,
      o.client_notes,
      o.status,
      m.match_percentage,
      r.product_requirement,
      r.delivery_location,
      c.company_name,
      c.contact_person AS client_contact,
      c.email AS client_email,
      s.supplier_name,
      s.contact_person AS supplier_contact,
      s.email AS supplier_email,
      off.product_offered
    FROM orders o
    JOIN matches m ON m.id = o.match_id
    JOIN requirements r ON r.id = o.requirement_id
    JOIN clients c ON c.id = o.client_id
    JOIN suppliers s ON s.id = o.supplier_id
    JOIN offerings off ON off.id = o.offering_id
    WHERE o.id = $1
    `,
    [orderId],
  );

  if (result.rows.length === 0) {
    return;
  }

  const row = result.rows[0];
  const qty = `${row.quantity_ordered} ${row.unit}`;
  const product = row.product_offered;
  const requirement = row.product_requirement;

  await emailQueue.add("send-order-notification", {
    email: row.client_email,
    subject: `Order request sent to ${row.supplier_name}`,
    body: `Hi ${row.client_contact},

Your order request has been sent to ${row.supplier_name} for:

"${product}"
Quantity: ${qty}
Requirement: ${requirement}
Match score: ${row.match_percentage}%
Delivery location: ${row.delivery_location}

${row.client_notes ? `Your notes: ${row.client_notes}\n\n` : ""}The supplier will review and respond in the Wisdom Match dashboard.

— Wisdom Match`,
  });

  await emailQueue.add("send-order-notification", {
    email: row.supplier_email,
    subject: `New order request from ${row.company_name}`,
    body: `Hi ${row.supplier_contact},

${row.company_name} placed an order request for your offering:

"${product}"
Quantity: ${qty}
Related requirement: ${requirement}
AI match score: ${row.match_percentage}%
Deliver to: ${row.delivery_location}

${row.client_notes ? `Client notes: ${row.client_notes}\n\n` : ""}Sign in to your supplier dashboard to accept or decline this request.

— Wisdom Match`,
  });
}

export async function notifyOrderStatusChange(orderId: string) {
  const result = await pool.query(
    `
    SELECT
      o.status,
      o.quantity_ordered,
      o.unit,
      o.supplier_response_notes,
      r.product_requirement,
      c.company_name,
      c.contact_person AS client_contact,
      c.email AS client_email,
      s.supplier_name,
      s.contact_person AS supplier_contact,
      s.email AS supplier_email,
      off.product_offered
    FROM orders o
    JOIN requirements r ON r.id = o.requirement_id
    JOIN clients c ON c.id = o.client_id
    JOIN suppliers s ON s.id = o.supplier_id
    JOIN offerings off ON off.id = o.offering_id
    WHERE o.id = $1
    `,
    [orderId],
  );

  if (result.rows.length === 0) {
    return;
  }

  const row = result.rows[0];
  const qty = `${row.quantity_ordered} ${row.unit}`;
  const statusLabel = row.status === "ACCEPTED" ? "accepted" : "declined";

  await emailQueue.add("send-order-notification", {
    email: row.client_email,
    subject: `${row.supplier_name} ${statusLabel} your order`,
    body: `Hi ${row.client_contact},

${row.supplier_name} has ${statusLabel} your order for "${row.product_offered}" (${qty}).

${row.supplier_response_notes ? `Supplier message: ${row.supplier_response_notes}\n\n` : ""}View the update in your client dashboard.

— Wisdom Match`,
  });

  await emailQueue.add("send-order-notification", {
    email: row.supplier_email,
    subject: `You ${statusLabel} order from ${row.company_name}`,
    body: `Hi ${row.supplier_contact},

This confirms you ${statusLabel} the order request from ${row.company_name} for "${row.product_offered}" (${qty}).

— Wisdom Match`,
  });
}
