<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  name: "MwMpCellGroup",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpCellGroupProps {
  title?: string;
  extra?: string;
  footer?: string;
  grouped?: boolean;
  role?: string;
}

withDefaults(defineProps<MpCellGroupProps>(), {
  title: undefined,
  extra: undefined,
  footer: undefined,
  grouped: false,
  role: undefined,
});
</script>

<template>
  <section
    :data-testid="attrs['data-testid']"
    class="mw-mp-cell-group"
    :class="{ 'mw-mp-cell-group--grouped': grouped }"
  >
    <div v-if="title || extra || $slots.header" class="mw-mp-cell-group__header">
      <slot name="header">
        <span v-if="title">{{ title }}</span>
        <span v-if="extra" class="mw-tabular">{{ extra }}</span>
      </slot>
    </div>
    <div class="mw-mp-cell-group__content" :role="role">
      <slot />
    </div>
    <div v-if="footer || $slots.footer" class="mw-mp-cell-group__footer">
      <slot name="footer">{{ footer }}</slot>
    </div>
  </section>
</template>
