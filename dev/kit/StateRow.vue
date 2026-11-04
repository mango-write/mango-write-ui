<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <span class="state-row__label">{{ label }}</span>
  <slot />
</template>
