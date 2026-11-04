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
  value?: string | number | null;
  severity?: TagSeverity | (string & {});
  rounded?: boolean;
  icon?: Component;
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
      <component :is="icon" v-if="icon" class="mw-tag__icon" aria-hidden="true" />
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
  box-sizing: border-box;
  gap: var(--space-1);
  min-height: calc(var(--control-h) - var(--space-2));
  padding-inline: calc(var(--control-px) * 0.5 + var(--space-0-5));
  border-radius: calc(var(--control-radius) - var(--space-0-5));
  background-color: var(--fill-default);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: calc(var(--control-font) - var(--space-px));
  font-weight: var(--weight-medium);
  line-height: var(--type-caption-line);
  white-space: nowrap;
}

.mw-tag--rounded {
  border-radius: var(--radius-full);
}

.mw-tag--primary {
  background-color: var(--accent-subtle);
  color: var(--text-accent);
}

.mw-tag--success {
  background-color: var(--success-subtle);
  color: var(--success-text);
}

.mw-tag--info {
  background-color: var(--info-subtle);
  color: var(--info-text);
}

.mw-tag--warn,
.mw-tag--warning {
  background-color: var(--warning-subtle);
  color: var(--warning-text);
}

.mw-tag--danger {
  background-color: var(--danger-subtle);
  color: var(--danger-text);
}

.mw-tag--contrast {
  background-color: var(--bg-inverse);
  color: var(--text-inverse);
}

.mw-tag__icon,
.mw-tag > svg {
  flex: none;
  width: calc(var(--control-icon) - var(--space-0-5));
  height: calc(var(--control-icon) - var(--space-0-5));
  font-size: calc(var(--control-icon) - var(--space-0-5));
}
</style>
