import { defineStore } from "pinia";
import { ref } from "vue";

// Client-only auth state. Logic (supabase auth, session persistence) arrives in
// Sprint 04. Shape is defined now so other modules can depend on it.
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const role = ref(null);
  const session = ref(null);
  const isAuthenticated = ref(false);

  return { user, role, session, isAuthenticated };
});
