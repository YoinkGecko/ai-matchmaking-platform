import pool from "../db";
import { generateEmbedding } from "./embedding.service";
import { buildRequirementText } from "./matching-text.service";

export interface CreateRequirementInput {
  clientId: string;
  productRequirement: string;
  category: string;
  quantityRequired: number;
  unit: string;
  specifications?: string;
  qualityGrade?: string;
  additionalNotes?: string;
  budget: number;
  currency: string;
  budgetType: "TOTAL" | "PER_UNIT";
  deliveryLocation: string;
  requiredByDate: string;
}

export const createRequirement = async (data: CreateRequirementInput) => {
  const embeddingText = buildRequirementText({
    productRequirement: data.productRequirement,
    category: data.category,
    specifications: data.specifications,
    qualityGrade: data.qualityGrade,
    additionalNotes: data.additionalNotes,
  });

  const embedding = await generateEmbedding(embeddingText);

  const query = `
  INSERT INTO requirements (
    client_id,
    product_requirement,
    category,
    quantity_required,
    unit,
    specifications,
    quality_grade,
    additional_notes,
    budget,
    currency,
    budget_type,
    delivery_location,
    required_by_date,
    embedding
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14::vector
  )
  RETURNING *;
  `;

  const values = [
    data.clientId,
    data.productRequirement,
    data.category,
    data.quantityRequired,
    data.unit,
    data.specifications ?? null,
    data.qualityGrade ?? null,
    data.additionalNotes ?? null,
    data.budget,
    data.currency,
    data.budgetType,
    data.deliveryLocation,
    data.requiredByDate,
    JSON.stringify(embedding),
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const clientExists = async (clientId: string) => {
  const query = `
    SELECT id
    FROM clients
    WHERE id = $1;
  `;

  const result = await pool.query(query, [clientId]);

  return result.rowCount !== null && result.rowCount > 0;
};

export const getRequirementsByClientId = async (clientId: string) => {
  const query = `
    SELECT
      id,
      client_id,
      product_requirement,
      category,
      quantity_required,
      unit,
      specifications,
      quality_grade,
      additional_notes,
      budget,
      currency,
      budget_type,
      delivery_location,
      required_by_date,
      status,
      created_at,
      updated_at
    FROM requirements
    WHERE client_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [clientId]);

  return result.rows;
};
