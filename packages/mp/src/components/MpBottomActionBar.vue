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
  offsetBottom: undefined,
  contained: false,
  safeArea: true,
});
const actionStyle = computed(() =>
  props.offsetBottom !== undefined ? { bottom: props.offsetBottom } : undefined,
);
</script>

<template>
  <div
    :data-testid="attrs['data-testid']"
    class="mw-mp-bottom-action"
    :class="{
      'mw-mp-bottom-action--contained': contained,
      'mw-mp-bottom-action--safe': safeArea,
    }"
    :style="actionStyle"
  >
    <div class="mw-mp-bottom-action__inner">
      <slot />
    </div>
  </div>
</template>
