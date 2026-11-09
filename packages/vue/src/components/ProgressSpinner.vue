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
    class="mw-progress-spinner"
    role="progressbar"
    :aria-label="ariaLabel"
  >
    <svg
      class="mw-progress-spinner__svg"
      viewBox="25 25 50 50"
      :style="{ animationDuration }"
    >
      <circle
        class="mw-progress-spinner__circle"
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
