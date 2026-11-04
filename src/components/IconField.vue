<script setup lang="ts">
defineOptions({ name: "MwIconField" });
</script>

<template>
  <div class="mw-icon-field p-iconfield">
    <slot />
  </div>
</template>

<style>
.mw-icon-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.mw-icon-field > .mw-input-icon:first-child {
  inset-inline-start: var(--control-px);
}

.mw-icon-field > .mw-input-icon:last-child:not(:first-child) {
  inset-inline-end: var(--control-px);
}

.mw-icon-field > .mw-input-icon:first-child ~ :is(input, .mw-control) {
  padding-inline-start: calc(var(--control-px) + var(--control-icon) + var(--control-gap));
}

.mw-icon-field > :is(input, .mw-control):has(~ .mw-input-icon:last-child) {
  padding-inline-end: calc(var(--control-px) + var(--control-icon) + var(--control-gap));
}

.mw-icon-field > :is(input, .mw-control) {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
