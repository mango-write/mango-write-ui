<script setup lang="ts">
import { t, type Bi } from "../i18n";

defineProps<{ label: string | Bi }>();
</script>

<template>
  <span class="state-row__label">{{ t(label) }}</span>
  <slot />
</template>
