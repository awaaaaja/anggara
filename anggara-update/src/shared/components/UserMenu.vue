<script setup>
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useRoute } from "vue-router";
import { roleFromPath, roleLabels } from "@/app/navigation";
import { LogOut, User, Settings } from "lucide-vue-next";

const route = useRoute();
const role = roleFromPath(route.path);
const initials = "MP"; // placeholder until auth lands in Sprint 04
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
      <span class="hidden text-sm font-medium text-text sm:inline">{{
        roleLabels[role] || "User"
      }}</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel>Akun</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem> <User class="mr-2 size-4" /> Profile </DropdownMenuItem>
      <DropdownMenuItem> <Settings class="mr-2 size-4" /> Settings </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-danger focus:text-danger">
        <LogOut class="mr-2 size-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
