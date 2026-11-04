<script setup lang="ts">
import { computed, useSlots } from "vue";

export type BadgeSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";

export type BadgeSize = "sm" | "md" | "lg" | "small" | "large";

export interface BadgeProps {
  value?: string | number;
  severity?: BadgeSeverity;
  size?: BadgeSize;
}

defineOptions({
  name: "MwBadge",
});

const props = withDefaults(defineProps<BadgeProps>(), {
  value: undefined,
  severity: "primary",
  size: "md",
});

const slots = useSlots();

const normalizedSize = computed<"sm" | "md" | "lg">(() => {
  if (props.size === "sm" || props.size === "small") return "sm";
  if (props.size === "lg" || props.size === "large") return "lg";
  return "md";
});

const isDot = computed(
  () =>
    !slots.default &&
    (props.value === undefined || props.value === null || props.value === ""),
);

const badgeClasses = computed(() => [
  `mw-badge--${props.severity}`,
  `mw-badge--${normalizedSize.value}`,
  props.size !== normalizedSize.value ? `mw-badge--${props.size}` : undefined,
  {
    "mw-badge--dot": isDot.value,
  },
]);
</script>

<template>
  <span
    class="mw-badge"
    :class="badgeClasses"
    :data-severity="severity"
    :data-size="normalizedSize"
  >
    <slot>{{ value }}</slot>
  </span>
</template>

<style>
.mw-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: var(--radius-pill);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.mw-badge--sm,
.mw-badge--small {
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  font-size: 0.625rem;
}

.mw-badge--lg,
.mw-badge--large {
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

.mw-badge--dot {
  min-width: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
}

.mw-badge--primary {
  background-color: var(--color-brand-500);
  color: var(--color-text-on-brand);
}

.mw-badge--secondary {
  background-color: var(--color-surface-muted);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}

.mw-badge--success {
  background-color: var(--color-success-500);
  color: var(--color-text-on-brand);
}

.mw-badge--info {
  background-color: var(--color-info-500);
  color: var(--color-text-on-brand);
}

.mw-badge--warn,
.mw-badge--warning {
  background-color: var(--color-warning-500);
  color: var(--color-text-on-brand);
}

.mw-badge--danger {
  background-color: var(--color-danger-500);
  color: var(--color-text-on-brand);
}

.mw-badge--contrast {
  background-color: var(--color-text-primary);
  color: var(--color-surface-base);
}
</style>
