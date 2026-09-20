import app from "./app";
import pool from "./db";
import { env } from "./config/env";

const startServer = async () => {
  try {
    await pool.query("SELECT 1");

    console.log("Database connected");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();