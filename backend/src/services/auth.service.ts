import pool from "../db";
import { generateAndStoreOtp } from "./otp.service";
import { emailQueue } from "./email-queue.service";

type Role = "CLIENT" | "SUPPLIER";

export async function requestOtp(email: string, role: Role) {
  const normalizedEmail = email.toLowerCase().trim();

  const table = role === "CLIENT" ? "clients" : "suppliers";

  const result = await pool.query(`SELECT id FROM ${table} WHERE email = $1`, [
    normalizedEmail,
  ]);

  if (result.rows.length === 0) {
    throw new Error(`No ${role.toLowerCase()} account found with this email`);
  }

  const existingUser = await pool.query(
    `SELECT id, role FROM users WHERE email = $1`,
    [normalizedEmail],
  );

  let userId: string;

  if (existingUser.rows.length === 0) {
    const userResult = await pool.query(
      `INSERT INTO users (email, role)
       VALUES ($1, $2)
       RETURNING id`,
      [normalizedEmail, role],
    );

    userId = userResult.rows[0].id;

    await pool.query(
      `UPDATE ${table}
       SET user_id = $1
       WHERE email = $2`,
      [userId, normalizedEmail],
    );
  } else {
    if (existingUser.rows[0].role !== role) {
      throw new Error("Role does not match this account");
    }

    userId = existingUser.rows[0].id;
  }

  const otp = await generateAndStoreOtp(normalizedEmail);

  await emailQueue.add("send-otp", {
    email: normalizedEmail,
    subject: "Your Login OTP",
    body: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return {
    userId,
    email: normalizedEmail,
    role,
  };
}
