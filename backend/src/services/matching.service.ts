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
