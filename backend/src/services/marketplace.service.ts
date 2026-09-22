import pool from "../db";

export const listMarketplaceOfferings = async () => {
  const result = await pool.query(`
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
      o.pricing_notes,
      o.fulfillment_location,
      o.minimum_delivery_days,
      o.maximum_delivery_days,
      o.additional_notes,
      o.photo_urls,
      o.created_at,
      s.supplier_name,
      s.business_location,
      s.contact_person,
      s.email AS supplier_email,
      s.phone AS supplier_phone
    FROM offerings o
    JOIN suppliers s ON s.id = o.supplier_id
    ORDER BY o.created_at DESC
  `);

  return result.rows;
};
