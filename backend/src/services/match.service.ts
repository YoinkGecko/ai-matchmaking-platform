import pool from "../db";

export interface MatchRecord {
  requirementId: string;

  offeringId: string;
  supplierId: string;

  score: number;
  percentage: number;

  semanticScore: number;

  productDecision: string;
  quantityCoverage: number;

  budgetStatus: string;
  deliveryStatus: string;

  productReason?: string;
  budgetExplanation?: string;
  deliveryExplanation?: string;
}

export const saveMatch = async (match: MatchRecord) => {
  const query = `
    INSERT INTO matches (
      requirement_id,
      offering_id,
      supplier_id,
      match_score,
      match_percentage,
      semantic_score,
      product_decision,
      quantity_coverage,
      budget_status,
      delivery_status,
      product_reason,
      budget_explanation,
      delivery_explanation
    )
    VALUES (
      $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13
    )

    ON CONFLICT (requirement_id, offering_id)
    DO UPDATE SET
      supplier_id = EXCLUDED.supplier_id,
      match_score = EXCLUDED.match_score,
      match_percentage = EXCLUDED.match_percentage,
      semantic_score = EXCLUDED.semantic_score,
      product_decision = EXCLUDED.product_decision,
      quantity_coverage = EXCLUDED.quantity_coverage,
      budget_status = EXCLUDED.budget_status,
      delivery_status = EXCLUDED.delivery_status,
      product_reason = EXCLUDED.product_reason,
      budget_explanation = EXCLUDED.budget_explanation,
      delivery_explanation = EXCLUDED.delivery_explanation,
      updated_at = NOW()

    RETURNING *;
  `;

  const values = [
    match.requirementId,
    match.offeringId,
    match.supplierId,

    match.score,
    match.percentage,

    match.semanticScore,

    match.productDecision,
    match.quantityCoverage,

    match.budgetStatus,
    match.deliveryStatus,

    match.productReason ?? null,
    match.budgetExplanation ?? null,
    match.deliveryExplanation ?? null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getMatchesForRequirement = async (requirementId: string) => {
  const query = `
    SELECT
      m.*,

      o.product_offered,
      o.category,
      o.available_quantity,
      o.unit,
      o.price,
      o.currency,
      o.price_type,
      o.fulfillment_location,

      s.supplier_name,
      s.business_location

    FROM matches m

    JOIN offerings o
      ON o.id = m.offering_id

    JOIN suppliers s
      ON s.id = m.supplier_id

    WHERE m.requirement_id = $1

    ORDER BY m.match_score DESC;
  `;

  const result = await pool.query(query, [requirementId]);

  return result.rows;
};
