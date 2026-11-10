<script setup lang="ts">
import { ref } from "vue";
import { useMpOverlay } from "../lib/use-mp-overlay.js";

defineOptions({
  name: "MwMpActionSheet",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpActionSheetOption {
  label: string;
  value: string | number;
  subtitle?: string;
  danger?: boolean;
  disabled?: boolean;
}

export interface MpActionSheetProps {
  open?: boolean;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  contained?: boolean;
  options: readonly MpActionSheetOption[];
}

const props = withDefaults(defineProps<MpActionSheetProps>(), {
  open: false,
  title: "请选择操作",
  subtitle: undefined,
  cancelLabel: "取消",
  contained: false,
});
const emit = defineEmits<{
  "update:open": [value: boolean];
  select: [option: MpActionSheetOption, value: string | number];
  cancel: [];
}>();
const panel = ref<HTMLElement | null>(null);

function close(): void {
  emit("update:open", false);
  emit("cancel");
}
function pickItem(item: MpActionSheetOption): void {
  if (item.disabled) return;
  emit("select", item, item.value);
  emit("update:open", false);
}
const { layerZ } = useMpOverlay({
  open: () => props.open,
  close,
  panel,
  lockScroll: () => !props.contained,
});
</script>

<template>
  <div
    v-if="open"
     class="mw-mp-sheet-backdrop"
    :class="{ 'mw-mp-sheet-backdrop--contained': contained }"
    :style="{ zIndex: layerZ }"
    data-testid="mp-action-sheet-backdrop"
    @touchmove.stop.prevent="() => {}"
    @click.self="close"
  >
    <div
      ref="panel"
      class="mw-mp-action-sheet mw-frost--thick"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      @click.stop
    >
      <div v-if="title || subtitle" class="mw-mp-action-sheet__header">
        <span v-if="title" class="mw-mp-action-sheet__title">{{ title }}</span>
        <span v-if="subtitle" class="mw-mp-action-sheet__desc">{{ subtitle }}</span>
      </div>
      <div class="mw-mp-action-sheet__list">
        <button
          v-for="item in options"
          :key="item.value"
          type="button"
          class="mw-mp-action-sheet__item"
          :class="{ 'mw-mp-action-sheet__item--danger': item.danger, 'is-disabled': item.disabled }"
          :disabled="item.disabled"
          :hover-class="item.disabled ? 'none' : 'is-pressed'"
          :data-testid="`mp-action-option-${String(item.value)}`"
          @click="pickItem(item)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.subtitle" class="mw-mp-action-sheet__item-sub">{{ item.subtitle }}</span>
        </button>
      </div>
      <div class="mw-mp-action-sheet__gap" aria-hidden="true" />
      <button
        type="button"
        class="mw-mp-action-sheet__cancel"
        hover-class="is-pressed"
        data-testid="mp-action-sheet-cancel"
        @click="close"
      >
        {{ cancelLabel }}
      </button>
    </div>
  </div>
</template>
