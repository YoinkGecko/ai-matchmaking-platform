import pool from "../db";

export interface CreateClientInput {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
}

export const createClient = async (data: CreateClientInput) => {
  const query = `
    INSERT INTO clients (
      company_name,
      contact_person,
      email,
      phone
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    data.companyName,
    data.contactPerson,
    data.email,
    data.phone ?? null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getClientById = async (id: string) => {
  const query = `
    SELECT *
    FROM clients
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};
