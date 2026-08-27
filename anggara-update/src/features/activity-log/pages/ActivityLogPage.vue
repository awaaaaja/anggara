<script setup>
import { computed } from "vue";
import { Search, ChevronLeft, ChevronRight, Activity } from "lucide-vue-next";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import Table from "@/shared/components/Table.vue";
import Skeleton from "@/shared/components/Skeleton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/components/ui/badge";
import {
  activityActionLabel,
  actorRoleLabel,
  activityActionOptions,
  actorRoleOptions,
} from "@/shared/lib/activity";
import { useActivity } from "@/features/activity-log/composables/useActivity";

const { actorRole, action, search, page, query, totalPages, setPage } = useActivity();
const { data, isLoading, isError, error, refetch } = query;

const rows = computed(() => data.value?.rows || []);

function actorName(r) {
  return r.actor?.full_name || (r.actor_role ? actorRoleLabel[r.actor_role] : "Sistem");
}
</script>

<template>
  <div class="space-y-4">
    <header>
      <h1 class="text-xl font-bold text-text">Log Aktivitas</h1>
      <p class="text-sm text-text-muted">Riwayat tindakan di sistem (pengajuan, review, dll).</p>
    </header>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat log aktivitas.'"
      @retry="refetch()"
    />

    <template v-else>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-xs">
          <Search class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input v-model="search" placeholder="Cari aksi / tabel..." class="pl-8" />
        </div>
        <div class="flex gap-2">
          <Select v-model="actorRole">
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Semua Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Peran</SelectItem>
              <SelectItem v-for="r in actorRoleOptions" :key="r" :value="r">
                {{ actorRoleLabel[r] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="action">
            <SelectTrigger class="w-44">
              <SelectValue placeholder="Semua Aksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Aksi</SelectItem>
              <SelectItem v-for="a in activityActionOptions" :key="a" :value="a">
                {{ activityActionLabel[a] }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Skeleton v-if="isLoading" class="h-72 w-full rounded-lg" />
      <EmptyState
        v-else-if="!rows.length"
        title="Tidak ada aktivitas"
        description="Belum ada log yang cocok dengan filter."
        :icon="Activity"
      />

      <template v-else>
        <Table>
          <thead>
            <tr class="border-b border-border text-xs uppercase text-text-muted">
              <th class="px-4 py-3 text-left font-medium">Waktu</th>
              <th class="px-4 py-3 text-left font-medium">Aktor</th>
              <th class="px-4 py-3 text-left font-medium">Aksi</th>
              <th class="px-4 py-3 text-left font-medium">Target</th>
              <th class="px-4 py-3 text-left font-medium">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-b border-border last:border-0">
              <td class="whitespace-nowrap px-4 py-3 text-text">
                {{ formatDateTime(r.created_at) }}
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-text">{{ actorName(r) }}</div>
                <div v-if="r.actor_role" class="text-xs text-text-muted">
                  {{ actorRoleLabel[r.actor_role] }}
                </div>
              </td>
              <td class="px-4 py-3">
                <Badge variant="secondary">{{ activityActionLabel[r.action] || r.action }}</Badge>
              </td>
              <td class="px-4 py-3 text-text">
                <div class="text-text">{{ r.target_table }}</div>
                <div class="text-xs text-text-muted">
                  {{ r.target_id?.slice(0, 8) }}
                </div>
              </td>
              <td class="max-w-xs px-4 py-3 text-text-muted">
                {{ r.metadata?.catatan || "-" }}
              </td>
            </tr>
          </tbody>
        </Table>

        <div class="flex items-center justify-between text-sm text-text-muted">
          <span>Halaman {{ page }} / {{ totalPages }}</span>
          <div class="flex gap-1">
            <button
              class="rounded-md border border-border p-1.5 disabled:opacity-50"
              :disabled="page <= 1"
              @click="setPage(page - 1)"
            >
              <ChevronLeft class="size-4" />
            </button>
            <button
              class="rounded-md border border-border p-1.5 disabled:opacity-50"
              :disabled="page >= totalPages"
              @click="setPage(page + 1)"
            >
              <ChevronRight class="size-4" />
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
