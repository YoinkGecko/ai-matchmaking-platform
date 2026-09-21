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

export const getClientByEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const result = await pool.query(
    `SELECT * FROM clients WHERE email = $1`,
    [normalizedEmail],
  );

  return result.rows[0] ?? null;
};

export interface UpdateClientProfileInput {
  companyName?: string;
  contactPerson?: string;
  phone?: string | null;
}

export const updateClientByEmail = async (
  email: string,
  data: UpdateClientProfileInput,
) => {
  const existing = await getClientByEmail(email);

  if (!existing) {
    return null;
  }

  const companyName = data.companyName ?? existing.company_name;
  const contactPerson = data.contactPerson ?? existing.contact_person;
  const phone =
    data.phone !== undefined ? data.phone : existing.phone;

  const result = await pool.query(
    `
    UPDATE clients
    SET
      company_name = $1,
      contact_person = $2,
      phone = $3,
      updated_at = NOW()
    WHERE email = $4
    RETURNING *;
    `,
    [companyName, contactPerson, phone ?? null, email.toLowerCase().trim()],
  );

  return result.rows[0];
};
