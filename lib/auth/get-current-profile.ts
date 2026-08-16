import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { ormawa, profiles } from "@/lib/db/schema";

export async function getCurrentProfile() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [row] = await db
    .select({
      profile: profiles,
      ormawaNama: ormawa.nama,
    })
    .from(profiles)
    .leftJoin(ormawa, eq(profiles.ormawa_id, ormawa.id))
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!row) return null;

  return {
    ...row.profile,
    email: user.email,
    ormawaNama: row.ormawaNama ?? null,
  };
}

export type CurrentProfile = NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>;