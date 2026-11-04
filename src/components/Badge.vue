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

export type BadgeSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

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
  size: undefined,
});

const slots = useSlots();

const normalizedSize = computed(() => {
  if (props.size === "sm" || props.size === "small") return "sm";
  if (props.size === "lg" || props.size === "large") return "lg";
  if (props.size === "xs" || props.size === "md") return props.size;
  return undefined;
});

const isDot = computed(
  () =>
    !slots.default &&
    (props.value === undefined || props.value === null || props.value === ""),
);

const badgeClasses = computed(() => [
  `mw-badge--${props.severity}`,
  normalizedSize.value ? [`mw-badge--${normalizedSize.value}`, `mw-size-${normalizedSize.value}`] : undefined,
  props.size && props.size !== normalizedSize.value ? `mw-badge--${props.size}` : undefined,
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
  box-sizing: border-box;
  min-width: calc(var(--control-icon) + var(--space-1));
  height: calc(var(--control-icon) + var(--space-1));
  padding-inline: var(--space-1);
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: max(var(--type-micro-size), calc(var(--control-font) - var(--space-0-5)));
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
}

.mw-badge--dot {
  min-width: var(--space-2);
  width: var(--space-2);
  height: var(--space-2);
  padding: 0;
}

.mw-badge--primary {
  background-color: var(--accent);
  color: var(--text-on-accent);
}

.mw-badge--danger {
  background-color: var(--danger);
  color: var(--text-on-danger);
}

.mw-badge--contrast {
  background-color: var(--bg-inverse);
  color: var(--text-inverse);
}

.mw-badge--secondary {
  background-color: var(--fill-default);
  color: var(--text-secondary);
}

.mw-badge--success {
  background-color: var(--success-subtle);
  color: var(--success-text);
}

.mw-badge--info {
  background-color: var(--info-subtle);
  color: var(--info-text);
}

.mw-badge--warn,
.mw-badge--warning {
  background-color: var(--warning-subtle);
  color: var(--warning-text);
}

.mw-badge--dot.mw-badge--secondary {
  background-color: var(--text-tertiary);
}

.mw-badge--dot.mw-badge--success {
  background-color: var(--success);
}

.mw-badge--dot.mw-badge--info {
  background-color: var(--info);
}

.mw-badge--dot.mw-badge--warn,
.mw-badge--dot.mw-badge--warning {
  background-color: var(--warning);
}
</style>
