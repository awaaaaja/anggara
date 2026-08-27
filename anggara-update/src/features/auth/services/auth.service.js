import { supabase } from "@/services/supabase";

// Thin Supabase Auth layer. UI never calls Supabase directly (AGENTS.md §5).
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, ormawa_id, logo_url")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}
