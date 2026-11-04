<script setup lang="ts">
defineOptions({ name: "MwInputGroupAddon" });
</script>

<template>
  <div class="mw-input-group-addon p-inputgroupaddon">
    <slot />
  </div>
</template>

<style>
.mw-input-group-addon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  min-width: var(--control-h);
  padding-inline: var(--control-px);
  border: var(--border-width) solid var(--control-border);
  border-radius: var(--control-radius);
  background-color: var(--fill-subtle);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  line-height: var(--type-body-sm-line);
  white-space: nowrap;
}

.mw-input-group-addon > svg {
  width: var(--control-icon);
  height: var(--control-icon);
}
</style>
