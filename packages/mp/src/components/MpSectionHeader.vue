<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  name: "MwMpSectionHeader",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpSectionHeaderProps {
  title: string;
  meta?: string;
}

withDefaults(defineProps<MpSectionHeaderProps>(), { meta: undefined });
</script>

<template>
  <div :data-testid="attrs['data-testid']" class="mw-mp-section-header">
    <h2 class="mw-mp-section-header__title">{{ title }}</h2>
    <span v-if="meta" class="mw-mp-section-header__meta">{{ meta }}</span>
    <slot name="end" />
  </div>
</template>
