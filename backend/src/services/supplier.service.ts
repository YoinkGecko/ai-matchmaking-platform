import pool from "../db";

export interface CreateSupplierInput {
  supplierName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  businessLocation: string;
}

export const createSupplier = async (data: CreateSupplierInput) => {
  const query = `
    INSERT INTO suppliers (
      supplier_name,
      contact_person,
      email,
      phone,
      business_location
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    data.supplierName,
    data.contactPerson,
    data.email,
    data.phone ?? null,
    data.businessLocation,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getSupplierById = async (id: string) => {
  const query = `
    SELECT *
    FROM suppliers
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};

export const getSupplierByEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const result = await pool.query(
    `SELECT * FROM suppliers WHERE email = $1`,
    [normalizedEmail],
  );

  return result.rows[0] ?? null;
};

export interface UpdateSupplierProfileInput {
  supplierName?: string;
  contactPerson?: string;
  phone?: string | null;
  businessLocation?: string;
}

export const updateSupplierByEmail = async (
  email: string,
  data: UpdateSupplierProfileInput,
) => {
  const existing = await getSupplierByEmail(email);

  if (!existing) {
    return null;
  }

  const supplierName = data.supplierName ?? existing.supplier_name;
  const contactPerson = data.contactPerson ?? existing.contact_person;
  const phone =
    data.phone !== undefined ? data.phone : existing.phone;
  const businessLocation =
    data.businessLocation ?? existing.business_location;

  const result = await pool.query(
    `
    UPDATE suppliers
    SET
      supplier_name = $1,
      contact_person = $2,
      phone = $3,
      business_location = $4,
      updated_at = NOW()
    WHERE email = $5
    RETURNING *;
    `,
    [
      supplierName,
      contactPerson,
      phone ?? null,
      businessLocation,
      email.toLowerCase().trim(),
    ],
  );

  return result.rows[0];
};
