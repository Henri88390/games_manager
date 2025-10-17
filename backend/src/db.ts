import { Pool } from "pg";

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://privio:privio@localhost:5432/privio",
});
