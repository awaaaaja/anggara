import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Keepalive: mencegah Supabase free tier auto-pause setelah 7 hari idle.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("keepalive gagal:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
