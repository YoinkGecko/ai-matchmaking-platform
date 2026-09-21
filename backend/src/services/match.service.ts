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

      r.product_requirement,
      r.category AS requirement_category,
      r.quantity_required,
      r.unit AS requirement_unit,
      r.budget AS requirement_budget,
      r.currency AS requirement_currency,
      r.budget_type AS requirement_budget_type,
      r.delivery_location AS requirement_delivery_location,
      r.required_by_date,
      r.specifications AS requirement_specifications,
      r.quality_grade AS requirement_quality_grade,
      r.additional_notes AS requirement_additional_notes,

      o.product_offered,
      o.category AS offering_category,
      o.available_quantity,
      o.unit AS offering_unit,
      o.specifications AS offering_specifications,
      o.quality_grade AS offering_quality_grade,
      o.price,
      o.currency,
      o.price_type,
      o.pricing_notes,
      o.fulfillment_location,
      o.minimum_delivery_days,
      o.maximum_delivery_days,
      o.additional_notes AS offering_additional_notes,

      s.supplier_name,
      s.contact_person,
      s.email AS supplier_email,
      s.phone AS supplier_phone,
      s.business_location

    FROM matches m

    JOIN requirements r
      ON r.id = m.requirement_id

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

export const getMatchDetail = async (requirementId: string, matchId: string) => {
  const query = `
    SELECT
      m.*,

      r.product_requirement,
      r.category AS requirement_category,
      r.quantity_required,
      r.unit AS requirement_unit,
      r.budget AS requirement_budget,
      r.currency AS requirement_currency,
      r.budget_type AS requirement_budget_type,
      r.delivery_location AS requirement_delivery_location,
      r.required_by_date,
      r.specifications AS requirement_specifications,
      r.quality_grade AS requirement_quality_grade,
      r.additional_notes AS requirement_additional_notes,

      o.product_offered,
      o.category AS offering_category,
      o.available_quantity,
      o.unit AS offering_unit,
      o.specifications AS offering_specifications,
      o.quality_grade AS offering_quality_grade,
      o.price,
      o.currency,
      o.price_type,
      o.pricing_notes,
      o.fulfillment_location,
      o.minimum_delivery_days,
      o.maximum_delivery_days,
      o.additional_notes AS offering_additional_notes,

      s.supplier_name,
      s.contact_person,
      s.email AS supplier_email,
      s.phone AS supplier_phone,
      s.business_location

    FROM matches m

    JOIN requirements r
      ON r.id = m.requirement_id

    JOIN offerings o
      ON o.id = m.offering_id

    JOIN suppliers s
      ON s.id = m.supplier_id

    WHERE m.requirement_id = $1
      AND m.id = $2
  `;

  const result = await pool.query(query, [requirementId, matchId]);

  return result.rows[0] ?? null;
};

export const getMatchesForSupplier = async (supplierId: string) => {
  const query = `
    SELECT
      m.*,

      r.product_requirement,
      r.category AS requirement_category,
      r.quantity_required,
      r.unit AS requirement_unit,
      r.delivery_location,
      r.required_by_date,
      r.status AS requirement_status,

      c.company_name,
      c.contact_person,

      o.product_offered,
      o.price,
      o.currency

    FROM matches m

    JOIN requirements r
      ON r.id = m.requirement_id

    JOIN clients c
      ON c.id = r.client_id

    JOIN offerings o
      ON o.id = m.offering_id

    WHERE m.supplier_id = $1

    ORDER BY m.match_score DESC;
  `;

  const result = await pool.query(query, [supplierId]);

  return result.rows;
};
