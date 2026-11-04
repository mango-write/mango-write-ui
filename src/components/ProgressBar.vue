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
  position: relative;
  width: 100%;
  height: 1.25rem;
  border-radius: var(--radius-pill);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
}

.mw-progress-bar--indeterminate {
  height: 0.375rem;
}

.mw-progress-bar__indicator {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-brand-500);
  color: var(--color-text-on-brand);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.mw-progress-bar--determinate .mw-progress-bar__indicator {
  transition: width var(--motion-duration-slow) var(--motion-ease-standard);
}

.mw-progress-bar--indeterminate .mw-progress-bar__indicator {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 40%;
  animation: mw-progress-bar-indeterminate 1.4s var(--motion-ease-standard) infinite;
}

.mw-progress-bar__label {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  padding-inline: 0.375rem;
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
