import pool from "../db";

export const findSimilarOfferings = async (
  requirementId: string,
  limit = 20,
) => {
  const query = `
    SELECT
    o.id,
    o.supplier_id,

    o.product_offered,
    o.category,
    o.available_quantity,
    o.unit,
    o.specifications,
    o.quality_grade,
    o.price,
    o.currency,
    o.price_type,
    o.fulfillment_location,
    o.minimum_delivery_days,
    o.maximum_delivery_days,

    r.product_requirement,
    r.category AS requirement_category,
    r.specifications AS requirement_specifications,
    r.quality_grade AS requirement_quality_grade,
    r.quantity_required,
    r.unit AS requirement_unit,
    r.budget AS requirement_budget,
    r.budget_type AS requirement_budget_type,
    r.required_by_date,
    r.allow_multiple_suppliers,

    1 - (r.embedding <=> o.embedding) AS semantic_score

FROM requirements r
CROSS JOIN offerings o

WHERE r.id = $1
  AND r.embedding IS NOT NULL
  AND o.embedding IS NOT NULL

ORDER BY r.embedding <=> o.embedding

LIMIT $2;
  `;

  const result = await pool.query(query, [requirementId, limit]);

  return result.rows;
};
