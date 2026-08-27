import { ref } from "vue";

// Global, client-only toast queue (DESIGN.md §15). Pinia is intentionally not
// used here — toasts are ephemeral UI state; design-system concern, not app state.
const toasts = ref([]);
let seq = 0;

export function useToast() {
  function push(message, type = "success", timeout = 4000) {
    const id = ++seq;
    toasts.value.push({ id, message, type });
    if (timeout > 0) {
      setTimeout(() => dismiss(id), timeout);
    }
    return id;
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    dismiss,
    success: (m, t) => push(m, "success", t),
    error: (m, t) => push(m, "error", t),
    warning: (m, t) => push(m, "warning", t),
  };
}
