<script setup>
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ormawaSchema,
  ormawaJenisOptions,
  ormawaStatusOptions,
} from "@/features/ormawa/schemas/ormawa.schema";

const props = defineProps({
  open: { type: Boolean, default: false },
  ormawa: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "save"]);

const isEdit = ref(false);

const { handleSubmit, errors, defineField, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(ormawaSchema),
  initialValues: { nama: "", jenis: "bem", deskripsi: "", status: "aktif" },
});
const [nama, namaAttrs] = defineField("nama");
const [jenis, jenisAttrs] = defineField("jenis");
const [deskripsi, deskripsiAttrs] = defineField("deskripsi");
const [status, statusAttrs] = defineField("status");

watch(
  () => props.open,
  (val) => {
    if (val) {
      isEdit.value = !!props.ormawa;
      if (props.ormawa) {
        setValues({
          nama: props.ormawa.nama || "",
          jenis: props.ormawa.jenis || "bem",
          deskripsi: props.ormawa.deskripsi || "",
          status: props.ormawa.status || "aktif",
        });
      } else {
        resetForm();
      }
    }
  },
);

function onOpenChange(val) {
  emit("update:open", val);
}

const onSubmit = handleSubmit((values) => {
  emit("save", { id: props.ormawa?.id, payload: values });
});
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ isEdit ? "Edit ORMAWA" : "Tambah ORMAWA" }}</DialogTitle>
        <DialogDescription>Kelola data organisasi mahasiswa.</DialogDescription>
      </DialogHeader>
      <form id="ormawa-form" class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1.5">
          <Label for="ormawa-nama">Nama</Label>
          <Input id="ormawa-nama" v-model="nama" v-bind="namaAttrs" />
          <p v-if="errors.nama" class="text-xs font-medium text-danger">⚠ {{ errors.nama }}</p>
        </div>
        <div class="space-y-1.5">
          <Label for="ormawa-jenis">Jenis</Label>
          <Select v-model="jenis" v-bind="jenisAttrs">
            <SelectTrigger id="ormawa-jenis">
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="o in ormawaJenisOptions" :key="o.value" :value="o.value">{{
                o.label
              }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.jenis" class="text-xs font-medium text-danger">⚠ {{ errors.jenis }}</p>
        </div>
        <div class="space-y-1.5">
          <Label for="ormawa-status">Status</Label>
          <Select v-model="status" v-bind="statusAttrs">
            <SelectTrigger id="ormawa-status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="o in ormawaStatusOptions" :key="o.value" :value="o.value">{{
                o.label
              }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-xs font-medium text-danger">⚠ {{ errors.status }}</p>
        </div>
        <div class="space-y-1.5">
          <Label for="ormawa-deskripsi">Deskripsi</Label>
          <Textarea id="ormawa-deskripsi" v-model="deskripsi" v-bind="deskripsiAttrs" />
          <p v-if="errors.deskripsi" class="text-xs font-medium text-danger">
            ⚠ {{ errors.deskripsi }}
          </p>
        </div>
      </form>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button type="submit" form="ormawa-form">Simpan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
