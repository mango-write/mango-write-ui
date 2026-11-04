<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { SkeletonAnimation, SkeletonShape } from "./skeleton";

defineOptions({ name: "MwSkeleton" });

const props = withDefaults(
  defineProps<{
    shape?: SkeletonShape;
    size?: string;
    width?: string;
    height?: string;
    borderRadius?: string;
    animation?: SkeletonAnimation;
  }>(),
  {
    shape: "rectangle",
    size: undefined,
    width: "100%",
    height: "1rem",
    borderRadius: undefined,
    animation: "wave",
  },
);

const classes = computed(() => [
  "mw-skeleton",
  "p-skeleton",
  "p-component",
  {
    "mw-skeleton--circle p-skeleton-circle": props.shape === "circle",
    "mw-skeleton--none p-skeleton-animation-none": props.animation === "none",
  },
]);

const inlineStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: props.size ?? props.width,
    height: props.size ?? props.height,
  };
  if (props.borderRadius !== undefined) {
    style.borderRadius = props.borderRadius;
  }
  return style;
});
</script>

<template>
  <div :class="classes" :style="inlineStyle" aria-hidden="true" />
</template>

<style>
.mw-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background-color: var(--fill-default);
}

.mw-skeleton--circle {
  border-radius: var(--radius-full);
}

.mw-skeleton:not(.mw-skeleton--none)::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(90deg, transparent, var(--fill-default), transparent);
  transform: translateX(-100%);
  animation: mw-skeleton-wave calc(var(--duration-slower) * 4) var(--ease-standard) infinite;
}

@keyframes mw-skeleton-wave {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-skeleton:not(.mw-skeleton--none)::after {
    animation: none;
    opacity: 0;
  }
}
</style>
