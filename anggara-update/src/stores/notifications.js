import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Dummy notification state for the shell. Real data source lands in a later sprint.
const seed = [
  {
    id: 1,
    title: "Proposal menunggu review",
    body: 'BEM KM Adzkia mengajukan proposal "Bakti Sosial".',
    time: "5 menit lalu",
    read: false,
  },
  {
    id: 2,
    title: "LPJ jatuh tempo",
    body: "LPJ HIMA Informatika harus disubmit sebelum 30 Agustus.",
    time: "2 jam lalu",
    read: false,
  },
  {
    id: 3,
    title: "Anggaran disetujui",
    body: 'Anggaran proposal "Seminar AI" telah ditetapkan.',
    time: "Kemarin",
    read: true,
  },
];

export const useNotificationStore = defineStore("notifications", () => {
  const items = ref(seed);

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length);

  function markAllRead() {
    items.value = items.value.map((n) => ({ ...n, read: true }));
  }
  function markRead(id) {
    items.value = items.value.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  return { items, unreadCount, markAllRead, markRead };
});
