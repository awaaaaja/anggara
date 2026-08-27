<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/shared/components/ui/button";
import Skeleton from "@/shared/components/Skeleton.vue";
import ProposalForm from "@/features/proposals/components/ProposalForm.vue";
import {
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useSubmitProposal,
} from "@/features/proposals/composables/useProposals";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = computed(() => route.params.id);
const isEdit = computed(() => !!id.value);

const { data, isLoading } = useProposal(id);
const initial = ref(null);

watch(data, (val) => {
  if (val) initial.value = val;
});

const create = useCreateProposal();
const update = useUpdateProposal();
const submit = useSubmitProposal();

const saving = ref(false);

async function onSave(values) {
  saving.value = true;
  try {
    if (isEdit.value) {
      await update.mutateAsync({ id: id.value, values });
    } else {
      const res = await create.mutateAsync({ ormawaId: auth.ormawaId, values });
      router.replace(`/ormawa/proposals/${res.id}/edit`);
    }
    router.push("/ormawa/proposals");
  } finally {
    saving.value = false;
  }
}

async function onSaveAndSubmit(values) {
  saving.value = true;
  try {
    let pid = id.value;
    if (isEdit.value) {
      await update.mutateAsync({ id: pid, values });
    } else {
      const res = await create.mutateAsync({ ormawaId: auth.ormawaId, values });
      pid = res.id;
    }
    await submit.mutateAsync(pid);
    router.push("/ormawa/proposals");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">
        {{ isEdit ? "Edit Proposal" : "Proposal Baru" }}
      </h1>
      <p class="text-sm text-text-muted">Ajukan rencana kegiatan ORMAWA Anda.</p>
    </div>

    <Skeleton v-if="isEdit && isLoading" class="h-96 w-full rounded-lg" />

    <div v-else class="rounded-lg border border-border bg-surface p-6">
      <ProposalForm
        :initial="initial"
        :allow-submit="isEdit"
        @save="onSave"
        @submit="onSaveAndSubmit"
        @cancel="router.push('/ormawa/proposals')"
      />
    </div>
  </div>
</template>
