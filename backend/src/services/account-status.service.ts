import pool from "../db";
import { UserRole } from "../middleware/auth.middleware";

export type AccountStatus = "ACTIVE" | "SUSPENDED";

export async function getAccountStatus(
  email: string,
  role: UserRole,
): Promise<AccountStatus> {
  if (role === "ADMIN") {
    return "ACTIVE";
  }

  try {
    const result = await pool.query(
      `
      SELECT account_status
      FROM users
      WHERE email = $1 AND role = $2
      `,
      [email.toLowerCase().trim(), role],
    );

    if (result.rows.length === 0) {
      return "ACTIVE";
    }

    const status = result.rows[0].account_status as AccountStatus;
    return status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
  } catch (error) {
    console.warn("account_status lookup skipped (run moderation_schema.sql)", error);
    return "ACTIVE";
  }
}

export async function setUserAccountStatus(
  userId: string,
  status: AccountStatus,
) {
  const result = await pool.query(
    `
    UPDATE users
    SET account_status = $2, updated_at = NOW()
    WHERE id = $1 AND role IN ('CLIENT', 'SUPPLIER')
    RETURNING id, email, role, account_status
    `,
    [userId, status],
  );

  return result.rows[0] ?? null;
}
