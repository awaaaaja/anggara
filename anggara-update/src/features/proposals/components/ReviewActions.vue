<script setup>
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Check, X, Pencil } from "lucide-vue-next";
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
import { approveSchema, reviewNoteSchema } from "@/features/proposals/schemas/review.schema";
import { useReviewProposal } from "@/features/proposals/composables/useReviewProposal";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  proposal: { type: Object, required: true },
});

const auth = useAuthStore();
const review = useReviewProposal();
const open = ref(null);

const canReview = computed(() => auth.role === "lkpka" && props.proposal.status === "diajukan");

const approveForm = useForm({
  validationSchema: toTypedSchema(approveSchema),
  initialValues: { nominal_disetujui: "", catatan: "" },
});
const {
  handleSubmit: submitApprove,
  errors: approveErrors,
  defineField: defineApprove,
  resetForm: resetApprove,
} = approveForm;
const [nominal, nominalAttrs] = defineApprove("nominal_disetujui");
const [approveCatatan, approveCatatanAttrs] = defineApprove("catatan");

const rejectForm = useForm({ validationSchema: toTypedSchema(reviewNoteSchema) });
const {
  handleSubmit: submitReject,
  errors: rejectErrors,
  defineField: defineReject,
  resetForm: resetReject,
} = rejectForm;
const [rejectCatatan, rejectCatatanAttrs] = defineReject("catatan");

const revisionForm = useForm({
  validationSchema: toTypedSchema(reviewNoteSchema),
});
const {
  handleSubmit: submitRevision,
  errors: revisionErrors,
  defineField: defineRevision,
  resetForm: resetRevision,
} = revisionForm;
const [revisionCatatan, revisionCatatanAttrs] = defineRevision("catatan");

function openDialog(which) {
  open.value = which;
  if (which === "approve") {
    resetApprove({
      values: {
        nominal_disetujui: props.proposal.anggaran_diajukan || "",
        catatan: "",
      },
    });
  } else if (which === "reject") {
    resetReject();
  } else {
    resetRevision();
  }
}

function onOpenChange(val) {
  if (!val) open.value = null;
}

const onApprove = submitApprove((values) => {
  review.mutate(
    {
      id: props.proposal.id,
      action: "approve",
      nominal: Number(values.nominal_disetujui),
      catatan: values.catatan || null,
    },
    { onSuccess: () => (open.value = null) },
  );
});
const onReject = submitReject((values) => {
  review.mutate(
    { id: props.proposal.id, action: "reject", catatan: values.catatan },
    { onSuccess: () => (open.value = null) },
  );
});
const onRevision = submitRevision((values) => {
  review.mutate(
    { id: props.proposal.id, action: "revision", catatan: values.catatan },
    { onSuccess: () => (open.value = null) },
  );
});
</script>

<template>
  <div v-if="canReview" class="flex flex-wrap gap-2">
    <Button variant="default" @click="openDialog('approve')">
      <Check class="mr-1 size-4" /> Setujui &amp; Anggaran
    </Button>
    <Button variant="outline" @click="openDialog('reject')">
      <X class="mr-1 size-4" /> Tolak
    </Button>
    <Button variant="outline" @click="openDialog('revision')">
      <Pencil class="mr-1 size-4" /> Revisi
    </Button>

    <!-- Approve -->
    <Dialog :open="open === 'approve'" @update:open="onOpenChange">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Proposal</DialogTitle>
          <DialogDescription>
            Tetapkan nominal anggaran yang disetujui untuk kegiatan ini.
          </DialogDescription>
        </DialogHeader>
        <form id="approve-form" class="space-y-4" @submit.prevent="onApprove">
          <div class="space-y-1.5">
            <Label for="nominal">Nominal Disetujui (Rp)</Label>
            <Input
              id="nominal"
              v-model="nominal"
              type="number"
              v-bind="nominalAttrs"
              :class="approveErrors.nominal_disetujui ? 'border-danger' : ''"
            />
            <p v-if="approveErrors.nominal_disetujui" class="text-xs font-medium text-danger">
              ⚠ {{ approveErrors.nominal_disetujui }}
            </p>
          </div>
          <div class="space-y-1.5">
            <Label for="approve-catatan">Catatan (opsional)</Label>
            <Textarea id="approve-catatan" v-model="approveCatatan" v-bind="approveCatatanAttrs" />
          </div>
        </form>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" form="approve-form" :disabled="review.isPending">
            <Check class="mr-1 size-4" /> Setujui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject -->
    <Dialog :open="open === 'reject'" @update:open="onOpenChange">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak Proposal</DialogTitle>
          <DialogDescription> Berikan alasan penolakan kepada ORMAWA. </DialogDescription>
        </DialogHeader>
        <form id="reject-form" class="space-y-4" @submit.prevent="onReject">
          <div class="space-y-1.5">
            <Label for="reject-catatan">Catatan Penolakan</Label>
            <Textarea
              id="reject-catatan"
              v-model="rejectCatatan"
              v-bind="rejectCatatanAttrs"
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
          <Button
            type="submit"
            form="reject-form"
            variant="destructive"
            :disabled="review.isPending"
          >
            <X class="mr-1 size-4" /> Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Request revision -->
    <Dialog :open="open === 'revision'" @update:open="onOpenChange">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minta Revisi</DialogTitle>
          <DialogDescription>
            Sampaikan catatan revisi yang harus diperbaiki ORMAWA.
          </DialogDescription>
        </DialogHeader>
        <form id="revision-form" class="space-y-4" @submit.prevent="onRevision">
          <div class="space-y-1.5">
            <Label for="revision-catatan">Catatan Revisi</Label>
            <Textarea
              id="revision-catatan"
              v-model="revisionCatatan"
              v-bind="revisionCatatanAttrs"
              :class="revisionErrors.catatan ? 'border-danger' : ''"
            />
            <p v-if="revisionErrors.catatan" class="text-xs font-medium text-danger">
              ⚠ {{ revisionErrors.catatan }}
            </p>
          </div>
        </form>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" form="revision-form" :disabled="review.isPending">
            <Pencil class="mr-1 size-4" /> Kirim Revisi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
