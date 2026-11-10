<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({
  name: "MwMpBottomActionBar",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpBottomActionBarProps {
  offsetBottom?: string;
  contained?: boolean;
  safeArea?: boolean;
}

const props = withDefaults(defineProps<MpBottomActionBarProps>(), {
  offsetBottom: "calc(var(--mp-tabbar-h) + var(--mw-mp-safe-bottom))",
  contained: false,
  safeArea: false,
});
const actionStyle = computed(() => ({ bottom: props.offsetBottom }));
</script>

<template>
  <div
    :data-testid="attrs['data-testid']"
    class="mw-mp-bottom-action"
    :class="{ 'mw-mp-bottom-action--contained': contained, 'mw-mp-bottom-action--safe': safeArea }"
    :style="actionStyle"
  >
    <slot />
  </div>
</template>
