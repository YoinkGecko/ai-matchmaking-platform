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
  allowMultipleSuppliers: boolean;
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
    allow_multiple_suppliers,
    embedding
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15::vector
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
    data.allowMultipleSuppliers ?? false,
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

export const getRequirementById = async (requirementId: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM requirements
    WHERE id = $1
    `,
    [requirementId],
  );

  return result.rows[0] ?? null;
};

export type UpdateRequirementInput = Omit<CreateRequirementInput, "clientId">;

export const updateRequirement = async (
  requirementId: string,
  clientId: string,
  data: UpdateRequirementInput,
) => {
  const existing = await getRequirementById(requirementId);

  if (!existing || String(existing.client_id) !== String(clientId)) {
    return null;
  }

  const norm = (v: unknown) =>
    v === null || v === undefined ? "" : String(v).trim();

  const semanticChanged =
    norm(existing.product_requirement) !== norm(data.productRequirement) ||
    norm(existing.category) !== norm(data.category) ||
    norm(existing.specifications) !== norm(data.specifications) ||
    norm(existing.quality_grade) !== norm(data.qualityGrade) ||
    norm(existing.additional_notes) !== norm(data.additionalNotes);

  let embeddingJson: string | null = null;
  if (semanticChanged) {
    const embeddingText = buildRequirementText({
      productRequirement: data.productRequirement,
      category: data.category,
      specifications: data.specifications,
      qualityGrade: data.qualityGrade,
      additionalNotes: data.additionalNotes,
    });
    try {
      const embedding = await generateEmbedding(embeddingText);
      embeddingJson = JSON.stringify(embedding);
    } catch (embeddingError) {
      console.warn(
        "Requirement update: embedding regeneration skipped",
        embeddingError,
      );
    }
  }

  const baseValues = [
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
    data.allowMultipleSuppliers ?? false,
  ];

  const query = embeddingJson
    ? `
    UPDATE requirements
    SET
      product_requirement = $2,
      category = $3,
      quantity_required = $4,
      unit = $5,
      specifications = $6,
      quality_grade = $7,
      additional_notes = $8,
      budget = $9,
      currency = $10,
      budget_type = $11,
      delivery_location = $12,
      required_by_date = $13,
      allow_multiple_suppliers = $14,
      embedding = $15::vector,
      updated_at = NOW()
    WHERE id = $1 AND client_id = $16
    RETURNING *;
  `
    : `
    UPDATE requirements
    SET
      product_requirement = $2,
      category = $3,
      quantity_required = $4,
      unit = $5,
      specifications = $6,
      quality_grade = $7,
      additional_notes = $8,
      budget = $9,
      currency = $10,
      budget_type = $11,
      delivery_location = $12,
      required_by_date = $13,
      allow_multiple_suppliers = $14,
      updated_at = NOW()
    WHERE id = $1 AND client_id = $15
    RETURNING *;
  `;

  const values = embeddingJson
    ? [requirementId, ...baseValues, embeddingJson, clientId]
    : [requirementId, ...baseValues, clientId];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return { before: existing, after: result.rows[0] };
};
