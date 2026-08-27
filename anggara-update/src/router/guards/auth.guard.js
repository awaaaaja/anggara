import { useAuthStore } from "@/stores/auth";

// Lazily initialise auth once per app load. Restores the persisted Supabase
// session so refresh keeps the user logged in (acceptance criterion).
let ready = null;
async function ensureReady() {
  const auth = useAuthStore();
  if (!ready) ready = auth.init();
  await ready;
  return auth;
}

const PUBLIC = ["/login", "/foundation"];
const ROLE_PREFIXES = ["mpm", "lkpka", "ormawa"];

export async function authGuard(to) {
  const auth = await ensureReady();
  const path = to.path;

  // Not authenticated → only public routes allowed.
  if (!auth.isAuthenticated) {
    if (PUBLIC.includes(path) || path.startsWith("/foundation")) return true;
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // Authenticated user hitting /login or / → send to their dashboard.
  if (path === "/login" || path === "/") {
    return { path: `/${auth.role}/dashboard` };
  }

  // Cross-role access is blocked (ORM awa can't open /mpm/* or /lkpka/* etc).
  const targetRole = path.split("/").filter(Boolean)[0];
  if (ROLE_PREFIXES.includes(targetRole) && targetRole !== auth.role) {
    return { path: `/${auth.role}/dashboard` };
  }

  return true;
}
