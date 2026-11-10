<script setup lang="ts">
import { useAttrs } from "vue";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpLoading",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpLoadingProps {
  label?: string;
}

withDefaults(defineProps<MpLoadingProps>(), { label: "加载中…" });
</script>

<template>
  <div :data-testid="attrs['data-testid']" class="mw-mp-loading" role="status" aria-live="polite">
    <MpIcon name="loading" :size="24" spin />
    <span>{{ label }}</span>
  </div>
</template>
