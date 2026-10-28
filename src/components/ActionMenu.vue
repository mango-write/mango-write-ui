<script setup lang="ts">
import { computed, ref } from "vue";
import ContextMenu from "primevue/contextmenu";
import type { ActionMenuItem } from "./action-menu";

const props = defineProps<{ items: ActionMenuItem[] }>();
const emit = defineEmits<{ hide: [] }>();

const menu = ref<InstanceType<typeof ContextMenu> | null>(null);
const normalizedItems = computed(() =>
  props.items.map((item) =>
    item.disabled ? { ...item, command: undefined, items: undefined } : item,
  ),
);

function show(event: Event) {
  menu.value?.show(event as MouseEvent);
}

function hide() {
  menu.value?.hide();
}

defineExpose({ show, hide });
</script>

<template>
  <ContextMenu ref="menu" :model="normalizedItems" class="mw-action-menu" @hide="emit('hide')">
    <template #item="{ item, props: itemProps }">
      <a
        v-bind="itemProps.action"
        class="mw-action-menu__item"
        :class="item.danger && 'mw-action-menu__item--danger'"
        v-tooltip.top="item.tooltip"
      >
        <slot name="icon" :item="item">
          <span v-bind="itemProps.icon" class="mw-action-menu__icon" />
        </slot>
        <span v-bind="itemProps.label" class="mw-action-menu__label">{{ item.label }}</span>
        <span v-if="item.shortcut" class="mw-action-menu__shortcut">{{ item.shortcut }}</span>
      </a>
    </template>
  </ContextMenu>
</template>

<style scoped>
.mw-action-menu {
  min-width: 200px;
  max-width: 320px;
}

.mw-action-menu__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mw-action-menu__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mw-action-menu__shortcut {
  flex: 0 0 auto;
  margin-inline-start: 1.5rem;
  color: var(--color-text-quaternary);
  font-family: var(--font-family-mono);
  font-size: 11px;
  line-height: 1;
}

.mw-action-menu__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.mw-action-menu :deep(.p-contextmenu-item.p-disabled .mw-action-menu__item) {
  pointer-events: auto;
}

.mw-action-menu__item--danger,
.mw-action-menu__item--danger :deep(.mw-action-menu__icon),
.mw-action-menu__item--danger :deep(.p-contextmenu-item-icon) {
  color: var(--color-danger-700);
}

.mw-action-menu.mw-action-menu :deep(.p-contextmenu-item .p-contextmenu-item-content:has(.mw-action-menu__item--danger) .p-contextmenu-item-icon) {
  color: var(--color-danger-700);
}

.mw-action-menu.mw-action-menu :deep(.p-contextmenu-item:not(.p-disabled) .p-contextmenu-item-content:has(.mw-action-menu__item--danger):hover) {
  background: var(--color-danger-surface);
}
</style>
