<script setup lang="ts">
defineOptions({ name: "MwProgressSpinner" });

withDefaults(
  defineProps<{
    strokeWidth?: string | number;
    fill?: string;
    animationDuration?: string;
    ariaLabel?: string;
  }>(),
  {
    strokeWidth: "4",
    fill: "none",
    animationDuration: "2s",
    ariaLabel: undefined,
  },
);
</script>

<template>
  <div
    class="mw-progress-spinner p-progressspinner p-component"
    role="progressbar"
    :aria-label="ariaLabel"
  >
    <svg
      class="mw-progress-spinner__svg p-progressspinner-spin"
      viewBox="25 25 50 50"
      :style="{ animationDuration }"
    >
      <circle
        class="mw-progress-spinner__circle p-progressspinner-circle"
        cx="50"
        cy="50"
        r="20"
        :fill="fill"
        :stroke-width="strokeWidth"
        stroke-miterlimit="10"
      />
    </svg>
  </div>
</template>

<style>
.mw-progress-spinner {
  position: relative;
  display: inline-block;
  width: var(--mw-progress-spinner-size, var(--space-10));
  height: var(--mw-progress-spinner-size, var(--space-10));
  color: var(--accent);
}

.mw-progress-spinner__svg {
  width: 100%;
  height: 100%;
  transform-origin: center center;
  animation: mw-progress-spinner-rotate calc(var(--duration-slower) * 5) linear infinite;
}

.mw-progress-spinner__circle {
  stroke: currentColor;
  stroke-dasharray: 89, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: mw-progress-spinner-dash calc(var(--duration-slower) * 4) var(--ease-standard) infinite;
}

@keyframes mw-progress-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes mw-progress-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-progress-spinner__circle {
    animation: none;
  }
}
</style>
