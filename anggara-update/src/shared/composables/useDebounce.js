import { ref, watch, unref, onUnmounted } from "vue";

// Debounce a ref/getter source. Returns a ref that updates `delay` ms after
// the source stops changing — used to avoid refetch storms on search input.
export function useDebounce(source, delay = 300) {
  const debounced = ref(unref(source));
  let timer;
  watch(
    source,
    (v) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        debounced.value = v;
      }, delay);
    },
    { deep: typeof unref(source) === "object" },
  );
  onUnmounted(() => clearTimeout(timer));
  return debounced;
}
