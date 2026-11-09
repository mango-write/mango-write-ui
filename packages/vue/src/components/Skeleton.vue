<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { SkeletonAnimation, SkeletonShape } from "./skeleton-defs";

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
  {
    "mw-skeleton--circle": props.shape === "circle",
    "mw-skeleton--none": props.animation === "none",
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
