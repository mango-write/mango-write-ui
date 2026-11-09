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
