import pool from "../db";
import {
  notifyOrderPlaced,
  notifyOrderStatusChange,
} from "./order-notification.service";

export interface PlaceOrderInput {
  clientEmail: string;
  requirementId: string;
  matchId: string;
  quantityOrdered: number;
  clientNotes?: string;
}

export interface SupplierOrderResponseInput {
  supplierEmail: string;
  orderId: string;
  status: "ACCEPTED" | "REJECTED";
  supplierResponseNotes?: string;
}

export const placeOrder = async (input: PlaceOrderInput) => {
  const clientResult = await pool.query(
    `SELECT id FROM clients WHERE email = $1`,
    [input.clientEmail.toLowerCase().trim()],
  );

  if (clientResult.rows.length === 0) {
    throw new Error("Client profile not found");
  }

  const clientId = clientResult.rows[0].id as string;

  const matchResult = await pool.query(
    `
    SELECT
      m.*,
      r.client_id,
      r.quantity_required,
      r.unit AS requirement_unit,
      r.status AS requirement_status
    FROM matches m
    JOIN requirements r ON r.id = m.requirement_id
    WHERE m.id = $1
      AND m.requirement_id = $2
    `,
    [input.matchId, input.requirementId],
  );

  if (matchResult.rows.length === 0) {
    throw new Error("Match not found");
  }

  const match = matchResult.rows[0];

  if (match.client_id !== clientId) {
    throw new Error("You do not have access to this requirement");
  }

  if (Number(match.match_percentage) <= 0) {
    throw new Error("Cannot place an order on a rejected match");
  }

  const existing = await pool.query(
    `SELECT id FROM orders WHERE match_id = $1`,
    [input.matchId],
  );

  if (existing.rows.length > 0) {
    throw new Error("An order has already been placed for this match");
  }

  if (input.quantityOrdered <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const unit = match.requirement_unit as string;

  const insertResult = await pool.query(
    `
    INSERT INTO orders (
      match_id,
      requirement_id,
      client_id,
      supplier_id,
      offering_id,
      quantity_ordered,
      unit,
      client_notes,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
    RETURNING *
    `,
    [
      input.matchId,
      input.requirementId,
      clientId,
      match.supplier_id,
      match.offering_id,
      input.quantityOrdered,
      unit,
      input.clientNotes ?? null,
    ],
  );

  const order = insertResult.rows[0];

  await pool.query(
    `UPDATE matches SET status = 'ACCEPTED', updated_at = NOW() WHERE id = $1`,
    [input.matchId],
  );

  await pool.query(
    `
    UPDATE requirements
    SET status = 'CONFIRMED', updated_at = NOW()
    WHERE id = $1
      AND status IN ('OPEN', 'MATCHED')
    `,
    [input.requirementId],
  );

  await notifyOrderPlaced(order.id);

  return getOrderById(order.id);
};

export const getOrderById = async (orderId: string) => {
  const result = await pool.query(
    `
    SELECT
      o.*,
      m.match_percentage,
      r.product_requirement,
      r.delivery_location,
      r.required_by_date,
      off.product_offered,
      s.supplier_name,
      s.email AS supplier_email,
      s.phone AS supplier_phone,
      c.company_name,
      c.email AS client_email
    FROM orders o
    JOIN matches m ON m.id = o.match_id
    JOIN requirements r ON r.id = o.requirement_id
    JOIN offerings off ON off.id = o.offering_id
    JOIN suppliers s ON s.id = o.supplier_id
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = $1
    `,
    [orderId],
  );

  return result.rows[0] ?? null;
};

export const getOrdersForClientEmail = async (email: string) => {
  const result = await pool.query(
    `
    SELECT
      o.*,
      m.match_percentage,
      r.product_requirement,
      r.delivery_location,
      off.product_offered,
      s.supplier_name,
      s.contact_person AS supplier_contact,
      s.business_location
    FROM orders o
    JOIN clients c ON c.id = o.client_id
    JOIN matches m ON m.id = o.match_id
    JOIN requirements r ON r.id = o.requirement_id
    JOIN offerings off ON off.id = o.offering_id
    JOIN suppliers s ON s.id = o.supplier_id
    WHERE c.email = $1
    ORDER BY o.created_at DESC
    `,
    [email.toLowerCase().trim()],
  );

  return result.rows;
};

export const getOrdersForSupplierEmail = async (email: string) => {
  const result = await pool.query(
    `
    SELECT
      o.*,
      m.match_percentage,
      r.product_requirement,
      r.delivery_location,
      r.required_by_date,
      off.product_offered,
      c.company_name,
      c.contact_person AS client_contact,
      c.email AS client_email,
      c.phone AS client_phone
    FROM orders o
    JOIN suppliers s ON s.id = o.supplier_id
    JOIN matches m ON m.id = o.match_id
    JOIN requirements r ON r.id = o.requirement_id
    JOIN offerings off ON off.id = o.offering_id
    JOIN clients c ON c.id = o.client_id
    WHERE s.email = $1
    ORDER BY
      CASE o.status WHEN 'PENDING' THEN 0 ELSE 1 END,
      o.created_at DESC
    `,
    [email.toLowerCase().trim()],
  );

  return result.rows;
};

export const respondToOrder = async (input: SupplierOrderResponseInput) => {
  const supplierResult = await pool.query(
    `SELECT id FROM suppliers WHERE email = $1`,
    [input.supplierEmail.toLowerCase().trim()],
  );

  if (supplierResult.rows.length === 0) {
    throw new Error("Supplier profile not found");
  }

  const supplierId = supplierResult.rows[0].id as string;

  const orderResult = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [input.orderId],
  );

  if (orderResult.rows.length === 0) {
    throw new Error("Order not found");
  }

  const order = orderResult.rows[0];

  if (order.supplier_id !== supplierId) {
    throw new Error("You do not have access to this order");
  }

  if (order.status !== "PENDING") {
    throw new Error("This order has already been responded to");
  }

  const updateResult = await pool.query(
    `
    UPDATE orders
    SET
      status = $1,
      supplier_response_notes = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
    `,
    [
      input.status,
      input.supplierResponseNotes ?? null,
      input.orderId,
    ],
  );

  await notifyOrderStatusChange(input.orderId);

  return getOrderById(updateResult.rows[0].id);
};
