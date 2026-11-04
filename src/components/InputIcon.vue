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
