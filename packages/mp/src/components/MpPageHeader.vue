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
  capsuleSafe?: boolean;
}

withDefaults(defineProps<MpPageHeaderProps>(), {
  description: undefined,
  capsuleSafe: false,
});
</script>

<template>
  <header
    :data-testid="attrs['data-testid']"
    class="mw-mp-page-header"
    :class="{ 'mw-mp-page-header--capsule-safe': capsuleSafe }"
  >
    <div v-if="$slots.eyebrow" class="mw-mp-page-header__eyebrow">
      <slot name="eyebrow" />
    </div>
    <div class="mw-mp-page-header__top">
      <h1 class="mw-mp-page-header__title">{{ title }}</h1>
      <div v-if="$slots.trailing" class="mw-mp-page-header__trailing">
        <slot name="trailing" />
      </div>
    </div>
    <p v-if="description" class="mw-mp-page-header__description">{{ description }}</p>
    <slot />
  </header>
</template>
