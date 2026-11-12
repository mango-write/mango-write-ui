<script setup lang="ts">
import type { AdminBoardSectionProps } from "./admin-defs";

defineOptions({
  name: "MwAdminBoardSection",
});

defineProps<AdminBoardSectionProps>();
</script>

<template>
  <section class="admin-board-section">
    <header v-if="title || $slots.title || $slots.drill" class="admin-board-section__head">
      <h3 v-if="title || $slots.title" class="admin-board-section__title">
        <slot name="title">{{ title }}</slot>
      </h3>
      <div v-if="$slots.drill" class="admin-board-section__drills">
        <slot name="drill" />
      </div>
    </header>
    <slot />
  </section>
</template>
