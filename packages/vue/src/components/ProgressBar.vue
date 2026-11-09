<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from "reka-ui";
import { computed } from "vue";

export type ProgressBarMode = "determinate" | "indeterminate";

export interface ProgressBarProps {
  value?: number;
  mode?: ProgressBarMode;
  showValue?: boolean;
}

defineOptions({
  name: "MwProgressBar",
});

const props = withDefaults(defineProps<ProgressBarProps>(), {
  value: 0,
  mode: "determinate",
  showValue: true,
});

const clampedValue = computed(() => {
  const raw = typeof props.value === "number" && !Number.isNaN(props.value) ? props.value : 0;
  return Math.min(100, Math.max(0, raw));
});

const rootModelValue = computed(() =>
  props.mode === "indeterminate" ? null : clampedValue.value,
);

const indicatorStyle = computed(() =>
  props.mode === "determinate" ? { width: `${clampedValue.value}%` } : undefined,
);
</script>

<template>
  <ProgressRoot
    :model-value="rootModelValue"
    :max="100"
    class="mw-progress-bar"
    :class="`mw-progress-bar--${mode}`"
    :data-mode="mode"
  >
    <ProgressIndicator class="mw-progress-bar__indicator" :style="indicatorStyle">
      <span
        v-if="mode === 'determinate' && (showValue || $slots.default)"
        class="mw-progress-bar__label"
      >
        <slot :value="clampedValue">{{ `${Math.round(clampedValue)}%` }}</slot>
      </span>
    </ProgressIndicator>
  </ProgressRoot>
</template>
