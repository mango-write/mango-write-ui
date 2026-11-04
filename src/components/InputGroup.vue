<script setup lang="ts">
defineOptions({ name: "MwInputGroup" });
</script>

<template>
  <div class="mw-input-group p-inputgroup">
    <slot />
  </div>
</template>

<style>
.mw-input-group {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--control-h);
}

.mw-input-group > * {
  flex: none;
}

.mw-input-group > :is(input, textarea, .mw-control) {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
}

/* :not(:only-child) 只为抬高优先级，压过子组件 scoped 的圆角。 */
.mw-input-group > :not(:first-child):not(:only-child) {
  margin-inline-start: calc(-1 * var(--border-width));
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.mw-input-group > :not(:last-child):not(:only-child) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.mw-input-group > :hover,
.mw-input-group > :focus-visible,
.mw-input-group > :focus-within,
.mw-input-group > [data-focused="true"] {
  position: relative;
  z-index: var(--z-raised);
}
</style>
