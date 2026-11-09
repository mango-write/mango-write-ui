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

<style scoped>
.admin-board-section {
  --mw-datatable-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-sunken);
}

.admin-board-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding-bottom: var(--space-2);
}

.admin-board-section__title {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
}

.admin-board-section__drills {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-inline-start: auto;
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-medium);
}
</style>
