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
