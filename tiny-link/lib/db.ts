import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  // pool.query is effectively "any" because of our simple pg declaration
  const res: any = await pool.query(text, params);
  return { rows: res.rows as T[], rowCount: res.rowCount as number };
}
