<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  name: "MwMpPageHeader",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpPageHeaderProps {
  title: string;
  description?: string;
}

withDefaults(defineProps<MpPageHeaderProps>(), { description: undefined });
</script>

<template>
  <header :data-testid="attrs['data-testid']" class="mw-mp-page-header">
    <h1 class="mw-mp-page-header__title">{{ title }}</h1>
    <p v-if="description" class="mw-mp-page-header__description">{{ description }}</p>
    <slot />
  </header>
</template>
