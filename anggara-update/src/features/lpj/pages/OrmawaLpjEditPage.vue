<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Trash2 } from "lucide-vue-next";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import Skeleton from "@/shared/components/Skeleton.vue";
import { useToast } from "@/shared/composables/useToast";
import { useLpj, useUpdateLpj, useSubmitLpj } from "@/features/lpj/composables/useLpj";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { data, isLoading } = useLpj(route.params.id);

const ringkasan = ref("");
const rows = ref([]);
const saving = ref(false);

watch(data, (val) => {
  if (val) {
    ringkasan.value = val.ringkasan_penggunaan_dana || "";
    rows.value = Array.isArray(val.rincian_pengeluaran)
      ? val.rincian_pengeluaran.map((r) => ({ ...r }))
      : [];
  }
});

const total = computed(() => rows.value.reduce((s, r) => s + (Number(r.jumlah) || 0), 0));

function addRow() {
  rows.value.push({ item: "", jumlah: 0, keterangan: "" });
}
function removeRow(i) {
  rows.value.splice(i, 1);
}

const update = useUpdateLpj();
const submit = useSubmitLpj();

function buildValues() {
  return {
    ringkasan_penggunaan_dana: ringkasan.value,
    rincian_pengeluaran: rows.value.map((r) => ({
      item: r.item,
      jumlah: Number(r.jumlah) || 0,
      keterangan: r.keterangan,
    })),
    total_realisasi: total.value,
  };
}

async function onSave() {
  if (!rows.value.length) {
    toast.error("Tambahkan minimal satu rincian pengeluaran");
    return;
  }
  saving.value = true;
  try {
    await update.mutateAsync({ id: route.params.id, values: buildValues() });
    router.push("/ormawa/lpj");
  } finally {
    saving.value = false;
  }
}

async function onSaveAndSubmit() {
  if (!rows.value.length) {
    toast.error("Tambahkan minimal satu rincian pengeluaran");
    return;
  }
  saving.value = true;
  try {
    await update.mutateAsync({ id: route.params.id, values: buildValues() });
    await submit.mutateAsync(route.params.id);
    router.push("/ormawa/lpj");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">Edit LPJ</h1>
      <p class="text-sm text-text-muted">
        {{ data?.proposal?.judul_kegiatan || "Laporan Pertanggungjawaban" }}
      </p>
    </div>

    <Skeleton v-if="isLoading" class="h-96 w-full rounded-lg" />

    <div v-else class="space-y-4 rounded-lg border border-border bg-surface p-6">
      <div class="space-y-1.5">
        <Label for="lpj-ringkas">Ringkasan Penggunaan Dana</Label>
        <Textarea id="lpj-ringkas" v-model="ringkasan" />
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <Label>Rincian Pengeluaran</Label>
          <Button type="button" size="sm" variant="outline" @click="addRow">
            <Plus class="mr-1 size-4" /> Tambah
          </Button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(r, i) in rows"
            :key="i"
            class="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_140px_1fr_auto]"
          >
            <Input v-model="r.item" placeholder="Item" />
            <Input v-model="r.jumlah" type="number" placeholder="Jumlah (Rp)" />
            <Input v-model="r.keterangan" placeholder="Keterangan" />
            <Button
              type="button"
              size="icon"
              variant="outline"
              class="text-danger"
              @click="removeRow(i)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
          <p v-if="!rows.length" class="text-sm text-text-muted">Belum ada rincian.</p>
        </div>
        <p class="mt-2 text-sm font-medium text-text">
          Total Realisasi: Rp {{ total.toLocaleString("id-ID") }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button :disabled="saving" @click="onSave">Simpan</Button>
        <Button :disabled="saving" variant="default" @click="onSaveAndSubmit">
          Simpan &amp; Ajukan
        </Button>
        <Button variant="outline" @click="router.push('/ormawa/lpj')">Batal</Button>
      </div>
    </div>
  </div>
</template>
