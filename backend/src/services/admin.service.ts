import pool from "../db";

export const getOverview = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM clients) AS clients,
      (SELECT COUNT(*)::int FROM suppliers) AS suppliers,
      (SELECT COUNT(*)::int FROM requirements) AS requirements,
      (SELECT COUNT(*)::int FROM offerings) AS offerings,
      (SELECT COUNT(*)::int FROM matches) AS matches
  `);

  return result.rows[0];
};

export const listUsers = async () => {
  const result = await pool.query(`
    SELECT id, email, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `);
  return result.rows;
};

export const listClients = async () => {
  const result = await pool.query(`
    SELECT
      c.*,
      (SELECT COUNT(*)::int FROM requirements r WHERE r.client_id = c.id) AS requirement_count
    FROM clients c
    ORDER BY c.created_at DESC
  `);
  return result.rows;
};

export const listSuppliers = async () => {
  const result = await pool.query(`
    SELECT
      s.*,
      (SELECT COUNT(*)::int FROM offerings o WHERE o.supplier_id = s.id) AS offering_count
    FROM suppliers s
    ORDER BY s.created_at DESC
  `);
  return result.rows;
};

export const listRequirements = async () => {
  const result = await pool.query(`
    SELECT
      r.*,
      c.company_name,
      c.email AS client_email,
      (SELECT COUNT(*)::int FROM matches m WHERE m.requirement_id = r.id) AS match_count
    FROM requirements r
    JOIN clients c ON c.id = r.client_id
    ORDER BY r.created_at DESC
  `);
  return result.rows;
};

export const listOfferings = async () => {
  const result = await pool.query(`
    SELECT
      o.*,
      s.supplier_name,
      s.email AS supplier_email
    FROM offerings o
    JOIN suppliers s ON s.id = o.supplier_id
    ORDER BY o.created_at DESC
  `);
  return result.rows;
};

export const listMatches = async () => {
  const result = await pool.query(`
    SELECT
      m.*,
      r.product_requirement,
      c.company_name,
      s.supplier_name,
      o.product_offered
    FROM matches m
    JOIN requirements r ON r.id = m.requirement_id
    JOIN clients c ON c.id = r.client_id
    JOIN suppliers s ON s.id = m.supplier_id
    JOIN offerings o ON o.id = m.offering_id
    ORDER BY m.match_score DESC, m.created_at DESC
  `);
  return result.rows;
};
