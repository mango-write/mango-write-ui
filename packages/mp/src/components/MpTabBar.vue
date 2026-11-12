<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import MpBadge from "./MpBadge.vue";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpTabBar",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: true },
} as any);
const attrs = useAttrs();
const slots = useSlots();

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
  collapsed?: boolean;
  /** 小程序端 `u-s` 编译期静态固定，条件插槽需显式传入当前是否挂载右侧动作位 */
  hasAction?: boolean;
  hasComposer?: boolean;
  expandAriaLabel?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<MpTabBarProps>(), {
  contained: false,
  collapsed: false,
  hasAction: undefined,
  hasComposer: undefined,
  expandAriaLabel: "展开导航",
  ariaLabel: "主要功能",
});
const emit = defineEmits<{
  "update:modelValue": [id: string];
  "update:collapsed": [collapsed: boolean];
}>();

const actionPresent = computed(() => props.hasAction ?? Boolean(slots.action));
const composerPresent = computed(() => props.hasComposer ?? Boolean(slots.composer));

const tabStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.items.length)}, minmax(0, 1fr))`,
}));

const activeIndex = computed(() =>
  props.items.findIndex((item) => item.id === props.modelValue),
);

const indicatorStyle = computed(() => ({
  width: `calc((100% - var(--space-1) * 2) / ${Math.max(1, props.items.length)})`,
  transform: `translateX(${Math.max(0, activeIndex.value) * 100}%)`,
}));
</script>

<template>
  <div
    :id="(attrs.id as string | undefined)"
    :data-testid="attrs['data-testid']"
    class="mw-mp-tabbar-rail"
    :class="{
      'mw-mp-tabbar-rail--contained mw-mp-tabbar--contained': contained,
      'mw-mp-tabbar-rail--collapsed': collapsed,
      'mw-mp-tabbar-rail--split': !collapsed && actionPresent,
      'mw-mp-tabbar-rail--has-action': actionPresent,
    }"
  >
    <div
      class="mw-mp-tabbar mw-frost"
      :class="{ 'mw-mp-tabbar--collapsed': collapsed }"
    >
      <nav
        class="mw-mp-tabbar__nav"
        :class="{ 'mw-mp-tabbar__nav--hidden': collapsed }"
        :style="tabStyle"
        :aria-label="ariaLabel"
        :aria-hidden="collapsed ? 'true' : undefined"
      >
        <span
          v-if="activeIndex >= 0"
          class="mw-mp-tabbar__indicator"
          aria-hidden="true"
          :style="indicatorStyle"
        />
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="mw-mp-tabbar__item"
          hover-class="is-pressed"
          :tabindex="collapsed ? -1 : 0"
          :class="{ 'mw-mp-tabbar__item--active is-active': modelValue === item.id }"
          :aria-current="modelValue === item.id ? 'page' : undefined"
          :data-testid="`mp-tab-${item.id}`"
          @click="emit('update:modelValue', item.id)"
        >
          <span class="mw-mp-tabbar__icon-wrap">
            <MpIcon v-if="item.icon" :name="item.icon" :size="24" data-testid="mp-tab-icon" />
            <MpBadge v-if="item.badge !== undefined" :value="item.badge" />
          </span>
          <span class="mw-mp-tabbar__label">{{ item.label }}</span>
        </button>
      </nav>
      <button
        type="button"
        class="mw-mp-tabbar-expand"
        :class="{ 'mw-mp-tabbar-expand--visible': collapsed }"
        hover-class="is-pressed"
        :tabindex="collapsed ? 0 : -1"
        :aria-hidden="collapsed ? undefined : 'true'"
        :aria-label="expandAriaLabel"
        :aria-expanded="collapsed ? 'false' : 'true'"
        data-testid="mp-tabbar-expand"
        @click="emit('update:collapsed', false)"
      >
        <MpIcon name="grid" :size="22" />
      </button>
    </div>
    <div
      v-if="$slots.composer || $slots.action"
      class="mw-mp-tabbar-rail__side"
      :class="{
        'mw-mp-tabbar-rail__side--composer': collapsed && composerPresent,
        'mw-mp-tabbar-rail__side--action': !collapsed && actionPresent,
        'mw-mp-tabbar-rail__side--empty': (collapsed && !composerPresent) || (!collapsed && !actionPresent),
      }"
    >
      <div
        v-if="$slots.action"
        class="mw-mp-tabbar-rail__action"
        :class="{ 'mw-mp-tabbar-rail__slot--hidden': collapsed || !actionPresent }"
        :aria-hidden="collapsed || !actionPresent ? 'true' : undefined"
      >
        <slot name="action" />
      </div>
      <div
        v-if="$slots.composer"
        class="mw-mp-tabbar-rail__composer"
        :class="{ 'mw-mp-tabbar-rail__slot--hidden': !collapsed || !composerPresent }"
        :aria-hidden="!collapsed || !composerPresent ? 'true' : undefined"
      >
        <slot name="composer" />
      </div>
    </div>
  </div>
</template>
