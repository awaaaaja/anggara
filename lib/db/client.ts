import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;
export type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Queryable = Db | DbTx;

/**
 * Jalankan fungsi dalam transaksi dengan identitas user sesi (RLS aktif).
 * `SET LOCAL ROLE authenticated` + claims JWT membuat policy RLS & fungsi
 * `auth.uid()` bekerja sesuai user. Dipakai oleh semua server action write.
 */
export async function dbAsUser<T>(userId: string, fn: (tx: DbTx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`set local role authenticated`);
    await tx.execute(
      sql`select set_config('request.jwt.claims', ${JSON.stringify({ sub: userId, role: "authenticated" })}, true)`,
    );
    return fn(tx);
  });
}

/**
 * Jalankan query sebagai user sesi bila userId diberikan (RLS aktif),
 * atau sebagai service role bila tidak (system/tanpa sesi).
 */
export function queryAs<T>(
  userId: string | null | undefined,
  fn: (q: Queryable) => Promise<T>,
): Promise<T> {
  return userId ? dbAsUser(userId, fn) : fn(db);
}
