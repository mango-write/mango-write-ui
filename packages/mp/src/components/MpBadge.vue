<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({
  name: "MwMpBadge",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpBadgeProps {
  value: number | string;
  max?: number;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<MpBadgeProps>(), { max: 99, ariaLabel: undefined });
const displayValue = computed(() =>
  typeof props.value === "number" && props.value > props.max ? `${props.max}+` : props.value,
);
</script>

<template>
  <span :data-testid="attrs['data-testid']" class="mw-mp-badge mw-tabular" :aria-label="ariaLabel">
    {{ displayValue }}
  </span>
</template>
