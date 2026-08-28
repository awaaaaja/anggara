import { supabase } from "@/services/supabase";

// Defense-in-depth: service methods verify the caller's role server-side
// (via Supabase Auth, not just client state) before issuing writes. The real
// enforcement boundary is RLS, but this fails fast and rejects obviously
// unauthorized calls with a clear error.
export class AuthorizationError extends Error {
  constructor(message = "Akses ditolak") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthorizationError("Sesi tidak valid");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, ormawa_id")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function assertRole(allowed) {
  const me = await getCurrentProfile();
  if (!allowed.includes(me.role)) {
    throw new AuthorizationError(`Hanya role ${allowed.join(", ")} yang diizinkan`);
  }
  return me;
}
