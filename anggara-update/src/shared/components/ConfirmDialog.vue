<script setup>
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

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Konfirmasi" },
  description: { type: String, default: "Tindakan ini tidak dapat dibatalkan." },
  confirmLabel: { type: String, default: "Hapus" },
});
const emit = defineEmits(["update:open", "confirm"]);
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button variant="destructive" @click="emit('confirm')">{{ confirmLabel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
