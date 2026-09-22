import pool from "../db";
import { generateEmbedding } from "./embedding.service";
import { buildOfferingText } from "./matching-text.service";
import {
  offeringEmbeddingText,
  offeringSemanticFieldsChanged,
} from "./offering-embedding.util";

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
  photoUrls?: string[];
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
      photo_urls,
      embedding
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16::jsonb, $17::vector
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
    JSON.stringify(data.photoUrls ?? []),
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
      photo_urls,
      created_at,
      updated_at
    FROM offerings
    WHERE supplier_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [supplierId]);

  return result.rows;
};

export const getOfferingById = async (offeringId: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM offerings
    WHERE id = $1
    `,
    [offeringId],
  );

  return result.rows[0] ?? null;
};

export type UpdateOfferingInput = Omit<CreateOfferingInput, "supplierId" | "photoUrls">;

export const updateOffering = async (
  offeringId: string,
  supplierId: string,
  data: UpdateOfferingInput,
) => {
  const existing = await getOfferingById(offeringId);

  if (!existing || String(existing.supplier_id) !== String(supplierId)) {
    return null;
  }

  let embeddingJson: string | null = null;
  if (offeringSemanticFieldsChanged(existing, data)) {
    try {
      const embedding = await generateEmbedding(offeringEmbeddingText(data));
      embeddingJson = JSON.stringify(embedding);
    } catch (embeddingError) {
      console.warn(
        "Offering update: embedding regeneration skipped",
        embeddingError,
      );
    }
  }

  const baseValues = [
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
  ];

  const query = embeddingJson
    ? `
    UPDATE offerings
    SET
      product_offered = $2,
      category = $3,
      available_quantity = $4,
      unit = $5,
      specifications = $6,
      quality_grade = $7,
      price = $8,
      currency = $9,
      price_type = $10,
      pricing_notes = $11,
      fulfillment_location = $12,
      minimum_delivery_days = $13,
      maximum_delivery_days = $14,
      additional_notes = $15,
      embedding = $16::vector,
      updated_at = NOW()
    WHERE id = $1 AND supplier_id = $17
    RETURNING *;
  `
    : `
    UPDATE offerings
    SET
      product_offered = $2,
      category = $3,
      available_quantity = $4,
      unit = $5,
      specifications = $6,
      quality_grade = $7,
      price = $8,
      currency = $9,
      price_type = $10,
      pricing_notes = $11,
      fulfillment_location = $12,
      minimum_delivery_days = $13,
      maximum_delivery_days = $14,
      additional_notes = $15,
      updated_at = NOW()
    WHERE id = $1 AND supplier_id = $16
    RETURNING *;
  `;

  const values = embeddingJson
    ? [offeringId, ...baseValues, embeddingJson, supplierId]
    : [offeringId, ...baseValues, supplierId];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return { before: existing, after: result.rows[0] };
};
