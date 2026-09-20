// @ts-expect-error pg does not provide bundled TypeScript declarations.
import { Pool } from "pg";
import { env } from "../config/env";

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

export default pool;