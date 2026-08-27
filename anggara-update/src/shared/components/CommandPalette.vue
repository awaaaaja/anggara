<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Search } from "lucide-vue-next";

// Controlled by AppShell (also opened via Ctrl+K). Data source is dummy for now.
const open = defineModel("open", { type: Boolean, default: false });
const router = useRouter();
const query = ref("");

const commands = [
  { group: "Aksi", label: "Buat Proposal Baru", to: "/ormawa/proposals/new" },
  { group: "Aksi", label: "Lihat Dashboard", to: "/ormawa/dashboard" },
  { group: "Proposal", label: "Bakti Sosial 2026", to: "/ormawa/proposals/1" },
  { group: "Proposal", label: "Seminar Kecerdasan Buatan", to: "/ormawa/proposals/2" },
  { group: "LPJ", label: "LPJ Bakti Sosial 2026", to: "/ormawa/lpj/1" },
  { group: "ORMAWA", label: "BEM KM Adzkia", to: "/mpm/ormawa" },
];

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  const filtered = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  const groups = {};
  for (const c of filtered) (groups[c.group] ||= []).push(c);
  return Object.entries(groups);
});

function select(item) {
  router.push(item.to);
  open.value = false;
  query.value = "";
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogTitle class="sr-only">Pencarian global</DialogTitle>
      <div class="flex items-center gap-2 border-b border-border px-4">
        <Search class="size-4 text-text-muted" aria-hidden="true" />
        <input
          v-model="query"
          type="text"
          placeholder="Cari proposal, LPJ, ORMAWA…"
          class="h-12 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          aria-label="Kata kunci pencarian"
        />
      </div>
      <ul class="max-h-80 overflow-y-auto p-2">
        <template v-for="[group, items] in results" :key="group">
          <li class="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {{ group }}
          </li>
          <li v-for="item in items" :key="item.label">
            <button
              type="button"
              class="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-text hover:bg-surface-secondary"
              @click="select(item)"
            >
              {{ item.label }}
            </button>
          </li>
        </template>
        <li v-if="results.length === 0" class="px-2 py-6 text-center text-sm text-text-muted">
          Tidak ada hasil.
        </li>
      </ul>
    </DialogContent>
  </Dialog>
</template>
