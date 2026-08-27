<script setup>
import { useNotificationStore } from "@/stores/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Bell } from "lucide-vue-next";

const notifications = useNotificationStore();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="relative rounded-md p-2 text-text-secondary hover:bg-surface-secondary hover:text-text"
      aria-label="Notifikasi"
    >
      <Bell class="size-5" aria-hidden="true" />
      <span
        v-if="notifications.unreadCount > 0"
        class="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white"
        >{{ notifications.unreadCount }}</span
      >
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-80 p-0">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <p class="text-sm font-semibold text-text">Notifikasi</p>
        <button
          class="text-xs font-medium text-primary hover:underline"
          @click="notifications.markAllRead()"
        >
          Tandai dibaca
        </button>
      </div>
      <ul class="max-h-80 overflow-y-auto">
        <li
          v-for="n in notifications.items"
          :key="n.id"
          class="flex gap-3 border-b border-border px-4 py-3 last:border-0"
          :class="n.read ? 'opacity-60' : ''"
        >
          <span
            class="mt-1.5 size-2 shrink-0 rounded-full"
            :class="n.read ? 'bg-border' : 'bg-primary'"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium text-text">{{ n.title }}</p>
            <p class="truncate text-xs text-text-muted">{{ n.body }}</p>
            <p class="mt-0.5 text-[11px] text-text-muted">{{ n.time }}</p>
          </div>
        </li>
      </ul>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
