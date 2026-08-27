<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "@/shared/components/Sidebar.vue";
import Topbar from "@/shared/components/Topbar.vue";
import CommandPalette from "@/shared/components/CommandPalette.vue";

const paletteOpen = ref(false);

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    paletteOpen.value = true;
  }
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <Sidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <Topbar @open-search="paletteOpen = true" />
      <main class="flex-1">
        <RouterView v-slot="{ Component }">
          <Transition
            enter-active-class="transition duration-[180ms] ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-[180ms] ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <CommandPalette v-model:open="paletteOpen" />
  </div>
</template>
