<script setup lang="ts">
import { vScrollFade } from "../../lib/scroll-fade";
import type { AdminBoardPageProps } from "./admin-defs";

defineOptions({
  name: "MwAdminBoardPage",
});

withDefaults(defineProps<AdminBoardPageProps>(), {
  title: undefined,
  teleport: true,
  actionsTarget: "#admin-header-actions",
});
</script>

<template>
  <div class="admin-panel admin-board-page">
    <Teleport v-if="teleport && $slots.actions" defer :to="actionsTarget">
      <slot name="actions" />
    </Teleport>
    <header v-else-if="!teleport && (title || $slots.actions)" class="mw-admin-shell-header">
      <h2 v-if="title" class="mw-admin-shell-header__title">{{ title }}</h2>
      <div v-if="$slots.actions" class="mw-admin-shell-header__actions">
        <slot name="actions" />
      </div>
    </header>
    <div v-if="$slots.toolbar" class="admin-board-page__toolbar">
      <slot name="toolbar" />
    </div>
    <div class="admin-board-page__body admin-panel--scrollable" v-scroll-fade>
      <div v-if="$slots.stats" class="admin-stats">
        <slot name="stats" />
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-board-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  gap: var(--space-3);
}

.admin-board-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.admin-board-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-panel--scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-1);
  margin: calc(-1 * var(--space-1));
}

.admin-panel--scrollable > * {
  flex-shrink: 0;
}

.admin-panel--scrollable :deep(.mw-datatable:not(.mw-datatable--flex-scrollable)) {
  flex: none;
  height: auto;
}

.admin-panel--scrollable :deep(.mw-datatable:not(.mw-datatable--flex-scrollable) .mw-datatable__table-container) {
  flex: none;
}

.admin-panel--scrollable :deep(.mw-datatable thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--mw-datatable-head-bg, var(--bg-raised));
  white-space: nowrap;
}

.mw-admin-shell-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: var(--border-width) solid var(--border-subtle);
  flex-shrink: 0;
}

.mw-admin-shell-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--type-title-size);
  line-height: var(--type-title-line);
  font-weight: var(--weight-semibold);
}

.mw-admin-shell-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}

.admin-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-8);
  flex-shrink: 0;
}
</style>
