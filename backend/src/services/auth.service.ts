import pool from "../db";
import jwt from "jsonwebtoken";
import { verifyOtp } from "./otp.service";
import { generateAndStoreOtp } from "./otp.service";
import { emailQueue } from "./email-queue.service";

export type Role = "CLIENT" | "SUPPLIER" | "ADMIN";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);
}

async function ensureAdminUser(email: string) {
  const existing = await pool.query(
    `SELECT id, role FROM users WHERE email = $1`,
    [email],
  );

  if (existing.rows.length === 0) {
    const inserted = await pool.query(
      `INSERT INTO users (email, role) VALUES ($1, 'ADMIN') RETURNING id`,
      [email],
    );
    return inserted.rows[0].id as string;
  }

  if (existing.rows[0].role !== "ADMIN") {
    throw new Error("This email is registered with a different role");
  }

  return existing.rows[0].id as string;
}

async function requestAdminOtp(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const allowed = getAdminEmails();

  if (allowed.length === 0) {
    throw new Error("Admin access is not configured (set ADMIN_EMAILS)");
  }

  if (!allowed.includes(normalizedEmail)) {
    throw new Error("This email is not authorized for admin access");
  }

  await ensureAdminUser(normalizedEmail);

  const otp = await generateAndStoreOtp(normalizedEmail);

  await emailQueue.add("send-otp", {
    email: normalizedEmail,
    subject: "Admin login OTP",
    body: `Your admin OTP is ${otp}. It expires in 5 minutes.`,
  });

  return {
    userId: null,
    email: normalizedEmail,
    role: "ADMIN" as const,
  };
}

export async function requestOtp(email: string, role: Role) {
  if (role === "ADMIN") {
    return requestAdminOtp(email);
  }

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

export async function verifyLoginOtp(email: string, otp: string, role: Role) {
  const normalizedEmail = email.toLowerCase().trim();

  const valid = await verifyOtp(normalizedEmail, otp);

  if (!valid) {
    throw new Error("Invalid or expired OTP");
  }

  if (role === "ADMIN") {
    const allowed = getAdminEmails();
    if (!allowed.includes(normalizedEmail)) {
      throw new Error("This email is not authorized for admin access");
    }
    await ensureAdminUser(normalizedEmail);
  }

  const result = await pool.query(
    `SELECT id, email, role
     FROM users
     WHERE email = $1`,
    [normalizedEmail],
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  if (user.role !== role) {
    throw new Error("Role does not match this account");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
