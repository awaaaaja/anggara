// Role-based route guard. Stub for Sprint 01 — real logic (redirect to /login
// when unauthenticated, redirect to role dashboard when authenticated) lands in
// Sprint 04. Registered via `router.beforeEach(authGuard)` once implemented.
export function authGuard(to, from, next) {
  next();
}
