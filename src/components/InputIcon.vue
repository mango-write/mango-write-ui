<script setup lang="ts">
defineOptions({ name: "MwInputIcon" });

const props = defineProps<{
  class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
}>();
</script>

<template>
  <span class="mw-input-icon p-inputicon" :class="props.class">
    <slot />
  </span>
</template>

<style>
.mw-input-icon {
  position: absolute;
  top: 50%;
  z-index: var(--z-raised);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon);
  height: var(--control-icon);
  color: var(--text-tertiary);
  font-size: var(--control-icon);
  line-height: 1;
  transform: translateY(-50%);
  pointer-events: none;
}

.mw-input-icon > svg {
  width: 100%;
  height: 100%;
  stroke-width: var(--icon-stroke);
}
</style>
