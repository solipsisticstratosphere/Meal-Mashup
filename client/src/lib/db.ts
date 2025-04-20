import { Pool, PoolClient } from "pg";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./.env" });
}

const dbConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
  max: 20,
  idleTimeoutMillis: 30000,
};

console.log("Database connection configured with:", {
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
});

const pool = new Pool(dbConfig);

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getById<T>(table: string, id: string): Promise<T | null> {
  const result = await query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.length > 0 ? result[0] : null;
}

export async function insert<T>(
  table: string,
  data: Record<string, unknown>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columnNames = keys.join(", ");

  const result = await query<T>(
    `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders}) RETURNING *`,
    values
  );

  return result[0];
}

export async function update<T>(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const result = await query<T>(
    `UPDATE ${table} SET ${setClauses} WHERE id = $${
      keys.length + 1
    } RETURNING *`,
    [...values, id]
  );

  return result.length > 0 ? result[0] : null;
}

export async function remove(table: string, id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.length > 0;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
