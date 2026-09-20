import pool from "../db";
import { generateEmbedding } from "./embedding.service";
import { buildOfferingText } from "./matching-text.service";

export interface CreateOfferingInput {
  supplierId: string;
  productOffered: string;
  category: string;
  availableQuantity: number;
  unit: string;
  specifications?: string;
  qualityGrade?: string;
  price: number;
  currency: string;
  priceType: "TOTAL" | "PER_UNIT";
  pricingNotes?: string;
  fulfillmentLocation: string;
  minimumDeliveryDays: number;
  maximumDeliveryDays: number;
  additionalNotes?: string;
}

export const supplierExists = async (supplierId: string) => {
  const query = `
    SELECT id
    FROM suppliers
    WHERE id = $1;
  `;

  const result = await pool.query(query, [supplierId]);

  return result.rowCount !== null && result.rowCount > 0;
};

export const createOffering = async (data: CreateOfferingInput) => {
  const embeddingText = buildOfferingText({
    productOffered: data.productOffered,
    category: data.category,
    specifications: data.specifications,
    qualityGrade: data.qualityGrade,
    pricingNotes: data.pricingNotes,
    additionalNotes: data.additionalNotes,
  });

  const embedding = await generateEmbedding(embeddingText);
  const query = `
    INSERT INTO offerings (
      supplier_id,
      product_offered,
      category,
      available_quantity,
      unit,
      specifications,
      quality_grade,
      price,
      currency,
      price_type,
      pricing_notes,
      fulfillment_location,
      minimum_delivery_days,
      maximum_delivery_days,
      additional_notes,
      embedding
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16::vector
    )
    RETURNING *;
  `;

  const values = [
    data.supplierId,
    data.productOffered,
    data.category,
    data.availableQuantity,
    data.unit,
    data.specifications ?? null,
    data.qualityGrade ?? null,
    data.price,
    data.currency,
    data.priceType,
    data.pricingNotes ?? null,
    data.fulfillmentLocation,
    data.minimumDeliveryDays,
    data.maximumDeliveryDays,
    data.additionalNotes ?? null,
    JSON.stringify(embedding),
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getOfferingsBySupplierId = async (supplierId: string) => {
  const query = `
    SELECT
      id,
      supplier_id,
      product_offered,
      category,
      available_quantity,
      unit,
      specifications,
      quality_grade,
      price,
      currency,
      price_type,
      pricing_notes,
      fulfillment_location,
      minimum_delivery_days,
      maximum_delivery_days,
      additional_notes,
      created_at,
      updated_at
    FROM offerings
    WHERE supplier_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [supplierId]);

  return result.rows;
};
