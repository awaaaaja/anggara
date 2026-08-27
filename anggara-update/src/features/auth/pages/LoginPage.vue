<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Loader2 } from "lucide-vue-next";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/shared/composables/useToast";
import { useRouter, useRoute } from "vue-router";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

const { handleSubmit, isSubmitting, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: "", password: "" },
});
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values.email, values.password);
    toast.success("Berhasil masuk");
    const target = route.query.redirect || `/${auth.role}/dashboard`;
    router.push(target);
  } catch (e) {
    const raw = e?.message || "";
    const msg = raw.toLowerCase().includes("invalid")
      ? "Email atau password salah"
      : raw || "Gagal masuk. Coba lagi.";
    toast.error(msg);
  }
});
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Brand panel (desktop) -->
    <div
      class="relative hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground md:flex"
    >
      <div class="text-2xl font-bold tracking-tight">ANGGARA</div>
      <div class="space-y-4">
        <h1 class="text-3xl font-bold leading-tight">
          Sistem Penganggaran & Transparansi Kegiatan ORMAWA
        </h1>
        <p class="max-w-md text-sm text-primary-foreground/80">
          Proposal, review, anggaran, dan LPJ dalam satu alur kerja yang terlihat.
        </p>
      </div>
      <p class="text-xs text-primary-foreground/60">Universitas Adzkia</p>
    </div>

    <!-- Form -->
    <div class="flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center md:text-left">
          <div class="mb-2 text-xl font-bold text-primary md:hidden">ANGGARA</div>
          <h2 class="text-2xl font-bold text-text">Masuk</h2>
          <p class="mt-1 text-sm text-text-muted">Gunakan akun yang dibuatkan MPM.</p>
        </div>

        <form class="space-y-5" novalidate @submit.prevent="onSubmit">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="nama@universitas.ac.id"
              :class="errors.email ? 'border-danger focus-visible:ring-danger' : ''"
              v-bind="emailAttrs"
            />
            <p v-if="errors.email" class="text-xs font-medium text-danger">⚠ {{ errors.email }}</p>
          </div>

          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :class="errors.password ? 'border-danger focus-visible:ring-danger' : ''"
              v-bind="passwordAttrs"
            />
            <p v-if="errors.password" class="text-xs font-medium text-danger">
              ⚠ {{ errors.password }}
            </p>
          </div>

          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
            <span>{{ isSubmitting ? "Memproses…" : "Masuk" }}</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
