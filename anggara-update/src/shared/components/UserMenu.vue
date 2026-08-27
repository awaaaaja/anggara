<script setup>
import { computed } from "vue";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { roleLabels } from "@/app/navigation";
import { LogOut, User, Settings } from "lucide-vue-next";

const router = useRouter();
const auth = useAuthStore();

const initials = computed(() => {
  const name = auth.fullName?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return auth.role ? auth.role[0].toUpperCase() : "U";
});

const displayName = computed(() => auth.fullName || roleLabels[auth.role] || "User");

async function onLogout() {
  await auth.logout();
  router.push("/login");
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="flex items-center gap-2 rounded-md p-1 hover:bg-surface-secondary"
      aria-label="Menu pengguna"
    >
      <Avatar class="size-8">
        <AvatarFallback class="bg-primary-soft text-xs font-semibold text-primary">{{
          initials
        }}</AvatarFallback>
      </Avatar>
      <span class="hidden text-sm font-medium text-text sm:inline">{{ displayName }}</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel>{{ displayName }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem> <User class="mr-2 size-4" /> Profile </DropdownMenuItem>
      <DropdownMenuItem> <Settings class="mr-2 size-4" /> Settings </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-danger focus:text-danger" @select="onLogout">
        <LogOut class="mr-2 size-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
