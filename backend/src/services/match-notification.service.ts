import pool from "../db";
import { emailQueue } from "./email-queue.service";

const MIN_NOTIFY_PERCENT = 35;

type SavedMatchRow = {
  match_percentage: number;
  supplier_id: string;
  offering_id: string;
};

export async function notifyMatchResults(
  requirementId: string,
  matches: SavedMatchRow[],
) {
  if (matches.length === 0) {
    return;
  }

  const ranked = [...matches].sort(
    (a, b) => Number(b.match_percentage) - Number(a.match_percentage),
  );

  let toNotify = ranked.filter(
    (m) => Number(m.match_percentage) >= MIN_NOTIFY_PERCENT,
  );

  if (toNotify.length === 0) {
    toNotify = ranked.slice(0, Math.min(3, ranked.length));
  }

  const contextResult = await pool.query(
    `
    SELECT
      r.product_requirement,
      r.category,
      r.delivery_location,
      c.company_name,
      c.contact_person,
      c.email AS client_email
    FROM requirements r
    JOIN clients c ON c.id = r.client_id
    WHERE r.id = $1
    `,
    [requirementId],
  );

  if (contextResult.rows.length === 0) {
    return;
  }

  const ctx = contextResult.rows[0];

  const offeringIds = toNotify.map((m) => m.offering_id);
  const offeringsResult = await pool.query(
    `
    SELECT
      o.id,
      o.product_offered,
      s.supplier_name,
      s.email AS supplier_email,
      s.id AS supplier_id
    FROM offerings o
    JOIN suppliers s ON s.id = o.supplier_id
    WHERE o.id = ANY($1::uuid[])
    `,
    [offeringIds],
  );

  const offeringMap = new Map(
    offeringsResult.rows.map((row) => [row.id, row]),
  );

  const clientLines = toNotify.map((m, index) => {
    const off = offeringMap.get(m.offering_id);
    const name = off?.supplier_name ?? "Supplier";
    const product = off?.product_offered ?? "Offering";
    return `${index + 1}. ${name} — ${product} (${m.match_percentage}% match)`;
  });

  await emailQueue.add("send-match-notification", {
    email: ctx.client_email,
    subject: `New supplier matches for: ${ctx.product_requirement}`,
    body: `Hi ${ctx.contact_person},

We found ${toNotify.length} supplier match(es) for your requirement "${ctx.product_requirement}" (${ctx.category}).

${clientLines.join("\n")}

Sign in to your Wisdom Match client dashboard to review scores, budget fit, and delivery alignment.

— Wisdom Match`,
  });

  const bySupplier = new Map<string, SavedMatchRow[]>();

  for (const match of toNotify) {
    const list = bySupplier.get(match.supplier_id) ?? [];
    list.push(match);
    bySupplier.set(match.supplier_id, list);
  }

  for (const [supplierId, supplierMatches] of bySupplier) {
    const supplierResult = await pool.query(
      `
      SELECT supplier_name, contact_person, email
      FROM suppliers
      WHERE id = $1
      `,
      [supplierId],
    );

    if (supplierResult.rows.length === 0) {
      continue;
    }

    const supplier = supplierResult.rows[0];

    const supplierLines = supplierMatches.map((m) => {
      const pct = m.match_percentage;
      return `• ${ctx.company_name} needs "${ctx.product_requirement}" — ${pct}% match (delivery: ${ctx.delivery_location})`;
    });

    await emailQueue.add("send-match-notification", {
      email: supplier.email,
      subject: `New client match: ${ctx.company_name}`,
      body: `Hi ${supplier.contact_person},

Your offering matched a new client requirement from ${ctx.company_name}.

${supplierLines.join("\n")}

Sign in to your Wisdom Match supplier dashboard to view match details.

— Wisdom Match`,
    });
  }
}
