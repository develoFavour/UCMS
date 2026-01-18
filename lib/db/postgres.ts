import { Pool, type PoolClient } from "pg"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased for cloud DB cold starts
      max: 20,
      ssl: {
        rejectUnauthorized: false, // Required for most cloud DBs like Neon
      },
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await getPool().query(text, params)
    const duration = Date.now() - start
    console.log("[DB] Executed query", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("[DB] Query error", { text, error })
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect()
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
