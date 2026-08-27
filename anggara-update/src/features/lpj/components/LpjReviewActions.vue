<script setup>
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Check, X } from "lucide-vue-next";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { lpjRejectSchema } from "@/features/lpj/schemas/lpj.schema";
import { useReviewLpj } from "@/features/lpj/composables/useLpj";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  lpj: { type: Object, required: true },
});

const auth = useAuthStore();
const { mutate: reviewMutate, isPending } = useReviewLpj();
const open = ref(null);

const canReview = computed(
  () => (auth.role === "lkpka" || auth.role === "mpm") && props.lpj.status === "menunggu",
);

const rejectForm = useForm({ validationSchema: toTypedSchema(lpjRejectSchema) });
const {
  handleSubmit: submitReject,
  errors: rejectErrors,
  defineField: defineReject,
  resetForm: resetReject,
} = rejectForm;
const [catatan, catatanAttrs] = defineReject("catatan");

function openDialog(which) {
  open.value = which;
  if (which === "reject") resetReject();
}
function onOpenChange(val) {
  if (!val) open.value = null;
}

const onApprove = () => {
  reviewMutate(
    { id: props.lpj.id, action: "approve", catatan: null },
    { onSuccess: () => (open.value = null) },
  );
};
const onReject = submitReject((values) => {
  reviewMutate(
    { id: props.lpj.id, action: "reject", catatan: values.catatan },
    { onSuccess: () => (open.value = null) },
  );
});
</script>

<template>
  <div v-if="canReview" class="flex flex-wrap gap-2">
    <Button variant="default" :disabled="isPending" @click="onApprove">
      <Check class="mr-1 size-4" /> Setujui LPJ
    </Button>
    <Button variant="outline" :disabled="isPending" @click="openDialog('reject')">
      <X class="mr-1 size-4" /> Tolak LPJ
    </Button>

    <Dialog :open="open === 'reject'" @update:open="onOpenChange">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak LPJ</DialogTitle>
          <DialogDescription>Berikan alasan penolakan LPJ.</DialogDescription>
        </DialogHeader>
        <form id="lpj-reject-form" class="space-y-4" @submit.prevent="onReject">
          <div class="space-y-1.5">
            <Label for="lpj-catatan">Catatan Penolakan</Label>
            <Textarea
              id="lpj-catatan"
              v-model="catatan"
              v-bind="catatanAttrs"
              :class="rejectErrors.catatan ? 'border-danger' : ''"
            />
            <p v-if="rejectErrors.catatan" class="text-xs font-medium text-danger">
              ⚠ {{ rejectErrors.catatan }}
            </p>
          </div>
        </form>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" form="lpj-reject-form" variant="destructive" :disabled="isPending">
            <X class="mr-1 size-4" /> Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
