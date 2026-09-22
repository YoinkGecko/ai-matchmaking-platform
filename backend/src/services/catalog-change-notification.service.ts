import pool from "../db";
import { emailQueue } from "./email-queue.service";

export const PRICE_DROP_NOTIFY_PERCENT = 20;

export type CatalogChangeLine = {
  label: string;
  from: string;
  to: string;
  highlight?: boolean;
};

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function pushChange(
  lines: CatalogChangeLine[],
  label: string,
  from: unknown,
  to: unknown,
  highlight = false,
) {
  const a = display(from);
  const b = display(to);
  if (a === b) {
    return;
  }
  lines.push({ label, from: a, to: b, highlight });
}

export function diffRequirement(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): CatalogChangeLine[] {
  const lines: CatalogChangeLine[] = [];

  pushChange(
    lines,
    "Product",
    before.product_requirement,
    after.product_requirement,
  );
  pushChange(lines, "Category", before.category, after.category);
  pushChange(
    lines,
    "Quantity",
    `${before.quantity_required} ${before.unit}`,
    `${after.quantity_required} ${after.unit}`,
  );
  pushChange(
    lines,
    "Budget",
    `${before.currency} ${before.budget} (${before.budget_type})`,
    `${after.currency} ${after.budget} (${after.budget_type})`,
  );
  pushChange(
    lines,
    "Delivery location",
    before.delivery_location,
    after.delivery_location,
  );
  pushChange(
    lines,
    "Required by",
    before.required_by_date,
    after.required_by_date,
  );
  pushChange(
    lines,
    "Specifications",
    before.specifications,
    after.specifications,
  );
  pushChange(lines, "Quality grade", before.quality_grade, after.quality_grade);
  pushChange(
    lines,
    "Additional notes",
    before.additional_notes,
    after.additional_notes,
  );
  pushChange(
    lines,
    "Multiple suppliers",
    before.allow_multiple_suppliers ? "Yes" : "No",
    after.allow_multiple_suppliers ? "Yes" : "No",
  );

  return lines;
}

export function diffOffering(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { lines: CatalogChangeLine[]; priceDropPercent: number | null } {
  const lines: CatalogChangeLine[] = [];

  pushChange(lines, "Product", before.product_offered, after.product_offered);
  pushChange(lines, "Category", before.category, after.category);
  pushChange(
    lines,
    "Available quantity",
    `${before.available_quantity} ${before.unit}`,
    `${after.available_quantity} ${after.unit}`,
  );

  const oldPrice = Number(before.price);
  const newPrice = Number(after.price);
  const samePricing =
    before.currency === after.currency && before.price_type === after.price_type;

  let priceDropPercent: number | null = null;
  if (samePricing && oldPrice > 0 && newPrice < oldPrice) {
    priceDropPercent = ((oldPrice - newPrice) / oldPrice) * 100;
  }

  const priceHighlight =
    priceDropPercent !== null && priceDropPercent >= PRICE_DROP_NOTIFY_PERCENT;

  pushChange(
    lines,
    "Price",
    `${before.currency} ${before.price} (${before.price_type})`,
    `${after.currency} ${after.price} (${after.price_type})`,
    priceHighlight,
  );

  pushChange(
    lines,
    "Fulfillment location",
    before.fulfillment_location,
    after.fulfillment_location,
  );
  pushChange(
    lines,
    "Delivery window (days)",
    `${before.minimum_delivery_days}–${before.maximum_delivery_days}`,
    `${after.minimum_delivery_days}–${after.maximum_delivery_days}`,
  );
  pushChange(
    lines,
    "Specifications",
    before.specifications,
    after.specifications,
  );
  pushChange(lines, "Quality grade", before.quality_grade, after.quality_grade);
  pushChange(
    lines,
    "Pricing notes",
    before.pricing_notes,
    after.pricing_notes,
  );
  pushChange(
    lines,
    "Additional notes",
    before.additional_notes,
    after.additional_notes,
  );

  return { lines, priceDropPercent };
}

function formatChangeBlock(lines: CatalogChangeLine[]): string {
  if (lines.length === 0) {
    return "Details were updated.";
  }

  return lines
    .map((line) => {
      const prefix = line.highlight ? "★ " : "• ";
      return `${prefix}${line.label}: ${line.from} → ${line.to}`;
    })
    .join("\n");
}

export async function notifyOfferingCatalogChange(
  offeringId: string,
  lines: CatalogChangeLine[],
  priceDropPercent: number | null,
) {
  if (lines.length === 0) {
    return;
  }

  const contextResult = await pool.query(
    `
    SELECT
      o.product_offered,
      s.supplier_name
    FROM offerings o
    JOIN suppliers s ON s.id = o.supplier_id
    WHERE o.id = $1
    `,
    [offeringId],
  );

  if (contextResult.rows.length === 0) {
    return;
  }

  const { product_offered, supplier_name } = contextResult.rows[0];

  const recipientsResult = await pool.query(
    `
    SELECT DISTINCT c.email, c.contact_person, c.company_name
    FROM clients c
    WHERE c.id IN (
      SELECT DISTINCT r.client_id
      FROM matches m
      JOIN requirements r ON r.id = m.requirement_id
      WHERE m.offering_id = $1
      UNION
      SELECT client_id FROM offering_conversations WHERE offering_id = $1
    )
    `,
    [offeringId],
  );

  if (recipientsResult.rows.length === 0) {
    return;
  }

  const bigDrop =
    priceDropPercent !== null && priceDropPercent >= PRICE_DROP_NOTIFY_PERCENT;

  const subject = bigDrop
    ? `Price drop ~${priceDropPercent!.toFixed(0)}% — ${product_offered} (${supplier_name})`
    : `Offering updated: ${product_offered} (${supplier_name})`;

  const intro = bigDrop
    ? `${supplier_name} lowered the price on "${product_offered}" by about ${priceDropPercent!.toFixed(0)}%. Other listing details may have changed as well:`
    : `${supplier_name} updated their offering "${product_offered}":`;

  const changeBlock = formatChangeBlock(lines);

  for (const client of recipientsResult.rows) {
    await emailQueue.add("send-catalog-change-notification", {
      email: client.email,
      subject,
      body: `Hi ${client.contact_person},

${intro}

${changeBlock}

Open the Marketplace or Messages tab in your Wisdom Match client dashboard to review and continue negotiations.

— Wisdom Match`,
    });
  }
}

export async function notifyRequirementCatalogChange(
  requirementId: string,
  lines: CatalogChangeLine[],
) {
  if (lines.length === 0) {
    return;
  }

  const contextResult = await pool.query(
    `
    SELECT
      r.product_requirement,
      c.company_name
    FROM requirements r
    JOIN clients c ON c.id = r.client_id
    WHERE r.id = $1
    `,
    [requirementId],
  );

  if (contextResult.rows.length === 0) {
    return;
  }

  const { product_requirement, company_name } = contextResult.rows[0];

  const recipientsResult = await pool.query(
    `
    SELECT DISTINCT s.email, s.contact_person, s.supplier_name
    FROM suppliers s
    JOIN matches m ON m.supplier_id = s.id
    WHERE m.requirement_id = $1
    `,
    [requirementId],
  );

  if (recipientsResult.rows.length === 0) {
    return;
  }

  const subject = `Client RFQ updated: ${product_requirement} (${company_name})`;
  const changeBlock = formatChangeBlock(lines);

  for (const supplier of recipientsResult.rows) {
    await emailQueue.add("send-catalog-change-notification", {
      email: supplier.email,
      subject,
      body: `Hi ${supplier.contact_person},

${company_name} updated their requirement "${product_requirement}":

${changeBlock}

Sign in to your Wisdom Match supplier dashboard to review match scores and respond.

— Wisdom Match`,
    });
  }
}
