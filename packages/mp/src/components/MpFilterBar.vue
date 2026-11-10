<script setup lang="ts">
import { useAttrs } from "vue";
import MpFilterChip from "./MpFilterChip.vue";

defineOptions({
  name: "MwMpFilterBar",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpFilterBarItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface MpFilterBarProps {
  modelValue: string;
  items: readonly MpFilterBarItem[];
  ariaLabel?: string;
}

withDefaults(defineProps<MpFilterBarProps>(), { ariaLabel: "筛选内容" });
const emit = defineEmits<{ "update:modelValue": [id: string] }>();
</script>

<template>
  <div :data-testid="attrs['data-testid']" class="mw-mp-filter-bar" role="group" :aria-label="ariaLabel">
    <MpFilterChip
      v-for="item in items"
      :key="item.id"
      :label="item.label"
      :selected="modelValue === item.id"
      :disabled="item.disabled"
      :data-testid="`mp-filter-${item.id}`"
      @click="emit('update:modelValue', item.id)"
    />
  </div>
</template>
