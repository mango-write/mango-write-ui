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

<style>
.mw-progress-bar {
  --_pb-h: var(--icon-lg);
  --_pb-ind-dur: calc(var(--duration-slow) * 4);
  position: relative;
  width: 100%;
  height: var(--_pb-h);
  border-radius: var(--radius-full);
  background-color: var(--fill-default);
  border: var(--border-width) solid var(--border-subtle);
  overflow: hidden;
}

.mw-progress-bar--indeterminate {
  --_pb-h: var(--space-1-5);
}

.mw-progress-bar__indicator {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent);
  color: var(--text-on-accent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mw-progress-bar--determinate .mw-progress-bar__indicator {
  transition: width var(--duration-slow) var(--ease-standard);
}

.mw-progress-bar--indeterminate .mw-progress-bar__indicator {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 40%;
  animation: mw-progress-bar-indeterminate var(--_pb-ind-dur) var(--ease-standard) infinite;
}

.mw-progress-bar__label {
  font-size: var(--type-caption-size);
  font-weight: var(--weight-semibold);
  line-height: 1;
  white-space: nowrap;
  padding-inline: var(--space-1-5);
}

@keyframes mw-progress-bar-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-progress-bar--determinate .mw-progress-bar__indicator {
    transition: none;
  }

  .mw-progress-bar--indeterminate .mw-progress-bar__indicator {
    width: 100%;
    animation: none;
  }
}
</style>
