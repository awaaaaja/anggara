import { defineStore } from "pinia";
import { ref } from "vue";
import {
  login as supaLogin,
  logout as supaLogout,
  getSession,
  getProfile,
  onAuthChange,
} from "@/features/auth/services/auth.service";

// Client auth state (AGENTS.md §4). Session persistence is handled by the
// Supabase browser client (localStorage); init() restores it on app boot.
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const role = ref(null);
  const session = ref(null);
  const isAuthenticated = ref(false);
  const fullName = ref("");
  const ormawaId = ref(null);
  const initialized = ref(false);
  let unsub = null;

  async function loadProfile(userId) {
    try {
      const profile = await getProfile(userId);
      role.value = profile.role;
      fullName.value = profile.full_name || "";
      ormawaId.value = profile.ormawa_id || null;
      user.value = { id: profile.id, email: session.value?.user?.email };
    } catch {
      // Profile row missing — keep auth but role unknown until corrected.
    }
  }

  function reset() {
    user.value = null;
    role.value = null;
    session.value = null;
    isAuthenticated.value = false;
    fullName.value = "";
    ormawaId.value = null;
  }

  async function init() {
    if (initialized.value) return;
    const s = await getSession();
    if (s) {
      session.value = s;
      isAuthenticated.value = true;
      await loadProfile(s.user.id);
    }
    unsub = onAuthChange((_event, s) => {
      session.value = s;
      isAuthenticated.value = !!s;
      if (s) loadProfile(s.user.id);
      else reset();
    });
    initialized.value = true;
  }

  async function login(email, password) {
    const data = await supaLogin(email, password);
    session.value = data.session;
    isAuthenticated.value = true;
    if (data.session) await loadProfile(data.session.user.id);
    return data;
  }

  async function logout() {
    await supaLogout();
    reset();
  }

  return {
    user,
    role,
    session,
    isAuthenticated,
    fullName,
    ormawaId,
    initialized,
    init,
    login,
    logout,
  };
});
