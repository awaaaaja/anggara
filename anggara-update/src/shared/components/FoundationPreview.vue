<script setup>
// Internal QA page for Sprint 02 — visual check of design tokens & primitives.
// Not part of any role route; safe to remove after design sign-off.
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import Table from "@/shared/components/Table.vue";
import Skeleton from "@/shared/components/Skeleton.vue";
import { useToast } from "@/shared/composables/useToast";

const { success, error, warning } = useToast();
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-10 p-8">
    <header>
      <h1 class="text-3xl font-bold text-text">Design System — QA</h1>
      <p class="mt-1 text-sm text-text-muted">Sprint 02 Foundation preview</p>
    </header>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Buttons</h2>
      <div class="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Danger</Button>
        <Button variant="link">Link</Button>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Form</h2>
      <div class="max-w-sm space-y-4">
        <div class="space-y-1.5">
          <Label for="demo">Nama Kegiatan</Label>
          <Input id="demo" placeholder="Contoh: Bakti Sosial" />
        </div>
        <div class="space-y-1.5">
          <Label for="desc">Deskripsi</Label>
          <Textarea id="desc" placeholder="Tulis deskripsi singkat" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="c1" :model-value="true" /><Label for="c1">Setuju</Label>
        </div>
        <div class="flex items-center gap-2">
          <Switch id="s1" :model-value="true" /><Label for="s1">Aktif</Label>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Badges & status</h2>
      <div class="flex flex-wrap gap-2">
        <Badge>Draft</Badge>
        <Badge variant="secondary">Diajukan</Badge>
        <Badge class="bg-warning-soft text-warning">Revisi Diminta</Badge>
        <Badge class="bg-danger-soft text-danger">Ditolak</Badge>
        <Badge class="bg-success-soft text-success">Disetujui</Badge>
        <Badge class="bg-primary-soft text-primary">Selesai</Badge>
      </div>
    </section>

    <Separator />

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Table</h2>
      <Table>
        <thead class="bg-surface-secondary text-text-secondary">
          <tr>
            <th class="px-4 py-3 font-semibold">Ormawa</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold text-right">Anggaran</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t border-border">
            <td class="px-4 py-3">BEM KM Adzkia</td>
            <td class="px-4 py-3">Disetujui</td>
            <td class="px-4 py-3 text-right">Rp 5.000.000</td>
          </tr>
        </tbody>
      </Table>
    </section>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Skeleton</h2>
      <div class="space-y-2">
        <Skeleton class="h-4 w-1/3" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-20 w-full" />
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Toasts</h2>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" @click="success('Proposal berhasil diajukan')">Success</Button>
        <Button variant="outline" @click="error('Koneksi bermasalah')">Error</Button>
        <Button variant="outline" @click="warning('LPJ hampir jatuh tempo')">Warning</Button>
      </div>
    </section>
  </div>
</template>
