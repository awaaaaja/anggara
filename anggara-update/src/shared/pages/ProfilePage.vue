<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { roleLabels } from "@/app/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { useToast } from "@/shared/composables/useToast";

const auth = useAuthStore();
const toast = useToast();

const fullName = ref(auth.fullName || "");
const logoUrl = ref("");

const saving = ref(false);

async function onSave() {
  saving.value = true;
  try {
    await auth.saveProfile({ fullName: fullName.value, logoUrl: logoUrl.value || undefined });
    toast.success("Profil berhasil diperbarui");
  } catch (e) {
    toast.error(e?.message || "Gagal memperbarui profil");
  } finally {
    saving.value = false;
  }
}

const initials = (auth.fullName || auth.role || "U").slice(0, 2).toUpperCase();
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">Profil</h1>
      <p class="text-sm text-text-muted">Informasi akun Anda.</p>
    </div>

    <div class="rounded-lg border border-border bg-surface p-6">
      <div class="flex items-center gap-4">
        <Avatar class="size-16">
          <img v-if="logoUrl" :src="logoUrl" alt="logo" class="size-16 rounded-full object-cover" />
          <AvatarFallback class="bg-primary-soft text-lg font-semibold text-primary">{{
            initials
          }}</AvatarFallback>
        </Avatar>
        <div>
          <p class="text-lg font-semibold text-text">{{ auth.fullName || "-" }}</p>
          <p class="text-sm text-text-muted">{{ roleLabels[auth.role] || auth.role }}</p>
          <p class="text-sm text-text-muted">{{ auth.user?.email }}</p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="onSave">
        <div class="space-y-1.5">
          <Label for="profile-name">Nama Lengkap</Label>
          <Input id="profile-name" v-model="fullName" />
        </div>
        <div class="space-y-1.5">
          <Label for="profile-logo">URL Logo</Label>
          <Input id="profile-logo" v-model="logoUrl" placeholder="https://…" />
        </div>
        <Button type="submit" :disabled="saving">Simpan Perubahan</Button>
      </form>
    </div>
  </div>
</template>
