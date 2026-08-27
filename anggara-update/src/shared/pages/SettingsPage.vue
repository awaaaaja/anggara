<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { roleLabels } from "@/app/navigation";
import { Moon, Sun } from "lucide-vue-next";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/composables/useToast";

const auth = useAuthStore();
const toast = useToast();

const dark = ref(false);

onMounted(() => {
  dark.value = localStorage.getItem("anggara-theme") === "dark";
  applyTheme();
});

function applyTheme() {
  document.documentElement.classList.toggle("dark", dark.value);
  localStorage.setItem("anggara-theme", dark.value ? "dark" : "light");
}

function toggleTheme() {
  dark.value = !dark.value;
  applyTheme();
  toast.success(dark.value ? "Mode gelap aktif" : "Mode terang aktif");
}

function logout() {
  auth.logout();
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">Pengaturan</h1>
      <p class="text-sm text-text-muted">Preferensi tampilan dan akun.</p>
    </div>

    <div class="space-y-4 rounded-lg border border-border bg-surface p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <component :is="dark ? Moon : Sun" class="size-5 text-text-muted" />
          <div>
            <Label>Mode Gelap</Label>
            <p class="text-xs text-text-muted">
              Tampilan lebih redup untuk lingkungan minim cahaya.
            </p>
          </div>
        </div>
        <Switch :checked="dark" @update:checked="toggleTheme" />
      </div>

      <div class="border-t border-border pt-4">
        <p class="text-sm text-text-muted">
          Akun: <span class="font-medium text-text">{{ auth.fullName || "-" }}</span> ({{
            roleLabels[auth.role] || auth.role
          }})
        </p>
        <Button variant="outline" class="mt-3" @click="logout">Keluar</Button>
      </div>
    </div>
  </div>
</template>
