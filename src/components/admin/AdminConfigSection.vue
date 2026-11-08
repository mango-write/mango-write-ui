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

<style scoped>
.admin-config-section {
  --mw-datatable-radius: var(--radius-sm);
  container-type: inline-size;
  width: 100%;
  box-sizing: border-box;
  padding: 0 var(--space-4) var(--space-1);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-sunken);
}

.admin-config-section__title {
  margin: 0;
  padding: var(--space-3) 0 var(--space-2);
  color: var(--text-primary);
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-line);
  font-weight: var(--weight-semibold);
}
</style>
