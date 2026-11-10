<script setup lang="ts">
import { computed, useAttrs } from "vue";
import MpBadge from "./MpBadge.vue";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpTabBar",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: true },
} as any);
const attrs = useAttrs();

export interface MpTabBarItem {
  id: string;
  label: string;
  icon?: MpIconName;
  badge?: number | string;
}

export interface MpTabBarProps {
  modelValue: string;
  items: readonly MpTabBarItem[];
  contained?: boolean;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<MpTabBarProps>(), {
  contained: false,
  ariaLabel: "主要功能",
});
const emit = defineEmits<{ "update:modelValue": [id: string] }>();
const tabStyle = computed(() => ({ gridTemplateColumns: `repeat(${props.items.length}, minmax(0, 1fr))` }));
</script>

<template>
  <nav
    :data-testid="attrs['data-testid']"
    class="mw-mp-tabbar mw-frost"
    :class="{ 'mw-mp-tabbar--contained': contained }"
    :style="tabStyle"
    :aria-label="ariaLabel"
  >
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="mw-mp-tabbar__item"
      hover-class="is-pressed"
      :class="{ 'mw-mp-tabbar__item--active is-active': modelValue === item.id }"
      :aria-current="modelValue === item.id ? 'page' : undefined"
      :data-testid="`mp-tab-${item.id}`"
      @click="emit('update:modelValue', item.id)"
    >
      <span class="mw-mp-tabbar__icon-wrap">
        <MpIcon v-if="item.icon" :name="item.icon" :size="24" data-testid="mp-tab-icon" />
        <MpBadge v-if="item.badge !== undefined" :value="item.badge" />
      </span>
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>
