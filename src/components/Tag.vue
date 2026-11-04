<script setup lang="ts">
import type { Component } from "vue";

export type TagSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";

export interface TagProps {
  value?: string | number;
  severity?: TagSeverity;
  rounded?: boolean;
  icon?: string | Component;
}

defineOptions({
  name: "MwTag",
});

withDefaults(defineProps<TagProps>(), {
  value: undefined,
  severity: "primary",
  rounded: false,
  icon: undefined,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <span
    class="mw-tag"
    :class="[`mw-tag--${severity}`, { 'mw-tag--rounded': rounded }]"
    :data-severity="severity"
    @click="emit('click', $event)"
  >
    <slot name="icon">
      <i
        v-if="typeof icon === 'string' && icon"
        :class="['mw-tag__icon', icon]"
        aria-hidden="true"
      />
      <component :is="icon" v-else-if="icon" class="mw-tag__icon" aria-hidden="true" />
    </slot>
    <slot>
      <span v-if="value !== undefined && value !== null" class="mw-tag__label">{{ value }}</span>
    </slot>
  </span>
</template>

<style>
.mw-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  box-shadow: var(--material-control-inset);
}

.mw-tag--rounded {
  border-radius: var(--radius-pill);
}

.mw-tag--primary {
  background-color: var(--color-brand-50);
  color: var(--color-brand-700);
  border: 1px solid var(--color-brand-200);
}

.mw-tag--secondary {
  background-color: var(--color-surface-muted);
  background-image: var(--material-control-face);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}

.mw-tag--success {
  background-color: var(--color-success-surface);
  color: var(--color-success-600);
  border: 1px solid var(--color-success-border);
}

.mw-tag--info {
  background-color: var(--color-info-surface);
  color: var(--color-info-500);
  border: 1px solid var(--color-info-border);
}

.mw-tag--warn,
.mw-tag--warning {
  background-color: var(--color-warning-surface);
  color: var(--color-warning-600);
  border: 1px solid var(--color-warning-border);
}

.mw-tag--danger {
  background-color: var(--color-danger-surface);
  color: var(--color-danger-700);
  border: 1px solid var(--color-danger-border);
}

.mw-tag--contrast {
  background-color: var(--color-text-primary);
  color: var(--color-surface-base);
  border: 1px solid var(--color-text-primary);
}

.mw-tag__icon {
  flex-shrink: 0;
  font-size: 0.75rem;
  width: 0.75rem;
  height: 0.75rem;
}
</style>
