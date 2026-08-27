<script setup>
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { proposalFormSchema } from "@/features/proposals/schemas/proposal.schema";

const props = defineProps({
  initial: { type: Object, default: null },
  allowSubmit: { type: Boolean, default: false },
});
const emit = defineEmits(["save", "cancel", "submit"]);

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(proposalFormSchema),
  initialValues: {
    judul_kegiatan: "",
    deskripsi: "",
    tujuan_kegiatan: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    lokasi: "",
    anggaran_diajukan: "",
  },
});
const [judul_kegiatan, jk] = defineField("judul_kegiatan");
const [deskripsi, dk] = defineField("deskripsi");
const [tujuan_kegiatan, tk] = defineField("tujuan_kegiatan");
const [tanggal_mulai, tm] = defineField("tanggal_mulai");
const [tanggal_selesai, ts] = defineField("tanggal_selesai");
const [lokasi, lk] = defineField("lokasi");
const [anggaran_diajukan, ak] = defineField("anggaran_diajukan");

watch(
  () => props.initial,
  (val) => {
    if (val) {
      setValues({
        judul_kegiatan: val.judul_kegiatan || "",
        deskripsi: val.deskripsi || "",
        tujuan_kegiatan: val.tujuan_kegiatan || "",
        tanggal_mulai: val.tanggal_mulai || "",
        tanggal_selesai: val.tanggal_selesai || "",
        lokasi: val.lokasi || "",
        anggaran_diajukan: val.anggaran_diajukan ?? "",
      });
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

const onSubmit = handleSubmit((values) => emit("save", values));
const onSubmitSubmit = handleSubmit((values) => emit("submit", values));
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <Label for="p-judul">Judul Kegiatan</Label>
      <Input id="p-judul" v-model="judul_kegiatan" v-bind="jk" />
      <p v-if="errors.judul_kegiatan" class="text-xs font-medium text-danger">
        ⚠ {{ errors.judul_kegiatan }}
      </p>
    </div>
    <div class="space-y-1.5">
      <Label for="p-deskripsi">Deskripsi</Label>
      <Textarea id="p-deskripsi" v-model="deskripsi" v-bind="dk" />
      <p v-if="errors.deskripsi" class="text-xs font-medium text-danger">
        ⚠ {{ errors.deskripsi }}
      </p>
    </div>
    <div class="space-y-1.5">
      <Label for="p-tujuan">Tujuan Kegiatan</Label>
      <Textarea id="p-tujuan" v-model="tujuan_kegiatan" v-bind="tk" />
      <p v-if="errors.tujuan_kegiatan" class="text-xs font-medium text-danger">
        ⚠ {{ errors.tujuan_kegiatan }}
      </p>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="p-mulai">Tanggal Mulai</Label>
        <Input id="p-mulai" v-model="tanggal_mulai" type="date" v-bind="tm" />
        <p v-if="errors.tanggal_mulai" class="text-xs font-medium text-danger">
          ⚠ {{ errors.tanggal_mulai }}
        </p>
      </div>
      <div class="space-y-1.5">
        <Label for="p-selesai">Tanggal Selesai</Label>
        <Input id="p-selesai" v-model="tanggal_selesai" type="date" v-bind="ts" />
        <p v-if="errors.tanggal_selesai" class="text-xs font-medium text-danger">
          ⚠ {{ errors.tanggal_selesai }}
        </p>
      </div>
    </div>
    <div class="space-y-1.5">
      <Label for="p-lokasi">Lokasi</Label>
      <Input id="p-lokasi" v-model="lokasi" v-bind="lk" />
      <p v-if="errors.lokasi" class="text-xs font-medium text-danger">⚠ {{ errors.lokasi }}</p>
    </div>
    <div class="space-y-1.5">
      <Label for="p-anggaran">Anggaran Diajukan (Rp)</Label>
      <Input id="p-anggaran" v-model="anggaran_diajukan" type="number" v-bind="ak" />
      <p v-if="errors.anggaran_diajukan" class="text-xs font-medium text-danger">
        ⚠ {{ errors.anggaran_diajukan }}
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button type="submit">Simpan</Button>
      <Button v-if="allowSubmit" type="button" variant="default" @click="onSubmitSubmit">
        Simpan &amp; Ajukan
      </Button>
      <Button type="button" variant="outline" @click="emit('cancel')">Batal</Button>
    </div>
  </form>
</template>
