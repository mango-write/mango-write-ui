<script setup lang="ts">
import type { AdminConfigSectionProps } from "./admin-defs";

defineOptions({
  name: "MwAdminConfigSection",
});

defineProps<AdminConfigSectionProps>();
</script>

<template>
  <section class="admin-config-section">
    <h3 v-if="title || $slots.title" class="admin-config-section__title">
      <slot name="title">{{ title }}</slot>
    </h3>
    <slot />
  </section>
</template>
