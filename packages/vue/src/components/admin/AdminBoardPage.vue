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
