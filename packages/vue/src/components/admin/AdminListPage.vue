<script setup lang="ts">
import type { AdminListPageProps } from "./admin-defs";

defineOptions({
  name: "MwAdminListPage",
});

withDefaults(defineProps<AdminListPageProps>(), {
  title: undefined,
  teleport: true,
  actionsTarget: "#admin-header-actions",
});
</script>

<template>
  <div class="admin-panel admin-list-page">
    <Teleport v-if="teleport && $slots.actions" defer :to="actionsTarget">
      <slot name="actions" />
    </Teleport>
    <header v-else-if="!teleport && (title || $slots.actions)" class="mw-admin-shell-header">
      <h2 v-if="title" class="mw-admin-shell-header__title">{{ title }}</h2>
      <div v-if="$slots.actions" class="mw-admin-shell-header__actions">
        <slot name="actions" />
      </div>
    </header>
    <div v-if="$slots.summary" class="admin-list-page__summary">
      <slot name="summary" />
    </div>
    <div v-if="$slots.filters" class="admin-list-page__filters">
      <slot name="filters" />
    </div>
    <div class="admin-list-page__body">
      <slot />
    </div>
    <div v-if="$slots.pagination" class="admin-list-page__pagination">
      <slot name="pagination" />
    </div>
  </div>
</template>
