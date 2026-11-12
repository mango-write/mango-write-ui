<script setup lang="ts">
import { ref } from "vue";
import { useMpOverlay } from "../lib/use-mp-overlay.js";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpSheet",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpSheetProps {
  open?: boolean;
  title?: string;
  subtitle?: string;
  closable?: boolean;
  dismissableMask?: boolean;
  contained?: boolean;
  closeLabel?: string;
}

const props = withDefaults(defineProps<MpSheetProps>(), {
  open: false,
  title: undefined,
  subtitle: undefined,
  closable: true,
  dismissableMask: true,
  contained: false,
  closeLabel: "关闭",
});
const emit = defineEmits<{ "update:open": [value: boolean]; close: [] }>();
const panel = ref<HTMLElement | null>(null);

function closeSheet(): void {
  emit("update:open", false);
  emit("close");
}
function onBackdropClick(): void {
  if (props.dismissableMask) closeSheet();
}
const { layerZ, rendered, closing } = useMpOverlay({
  open: () => props.open,
  close: closeSheet,
  panel,
  lockScroll: () => !props.contained,
  exitDurationMs: 180,
});
</script>

<template>
  <div
    v-if="rendered"
    class="mw-mp-sheet-backdrop"
    :class="{
      'mw-mp-sheet-backdrop--contained': contained,
      'mw-mp-sheet-backdrop--closing': closing,
    }"
    :style="{ zIndex: layerZ }"
    data-testid="mp-sheet-backdrop"
    @touchmove.stop.prevent="() => {}"
    @click.self="onBackdropClick"
  >
    <div
      ref="panel"
      class="mw-mp-sheet mw-frost--thick"
      :class="{ 'mw-mp-sheet--closing': closing }"
      role="dialog"
      aria-modal="true"
      :aria-label="title || closeLabel"
      tabindex="-1"
      @click.stop
    >
      <div class="mw-mp-sheet__handle-bar" aria-hidden="true"><span class="mw-mp-sheet__handle" /></div>
      <div v-if="title || subtitle || closable || $slots.header" class="mw-mp-sheet__header">
        <slot name="header">
          <div class="mw-mp-sheet__title-wrap">
            <span v-if="title" class="mw-mp-sheet__title">{{ title }}</span>
            <span v-if="subtitle" class="mw-mp-sheet__subtitle">{{ subtitle }}</span>
          </div>
        </slot>
        <button
          v-if="closable"
          type="button"
          class="mw-mp-sheet__close"
          hover-class="is-pressed"
          :aria-label="closeLabel"
          data-testid="mp-sheet-close"
          @click="closeSheet"
        >
          <MpIcon name="close" :size="18" />
        </button>
      </div>
      <div class="mw-mp-sheet__body"><slot /></div>
      <div v-if="$slots.footer" class="mw-mp-sheet__footer"><slot name="footer" /></div>
    </div>
  </div>
</template>
