<script setup lang="ts">
import { ref, watch } from "vue";
import { useMpConfirm } from "../lib/mp-confirm.js";
import { useMpOverlay } from "../lib/use-mp-overlay.js";

defineOptions({
  name: "MwMpConfirmHost",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpConfirmHostProps {
  contained?: boolean;
}

const props = withDefaults(defineProps<MpConfirmHostProps>(), { contained: false });
const confirm = useMpConfirm();
const panel = ref<HTMLElement | null>(null);
const displayed = ref(confirm.active.value);

watch(
  () => confirm.active.value,
  (active) => {
    if (active) displayed.value = active;
  },
  { immediate: true },
);

const { layerZ, rendered, closing } = useMpOverlay({
  open: () => Boolean(confirm.active.value),
  close: () => confirm.reject(),
  panel,
  lockScroll: () => !props.contained,
  exitDurationMs: 110,
});
</script>

<template>
  <div
    v-if="rendered && displayed"
    class="mw-mp-dialog-backdrop"
    :class="{
      'mw-mp-dialog-backdrop--contained': contained,
      'mw-mp-dialog-backdrop--closing': closing,
    }"
    :style="{ zIndex: layerZ }"
    data-testid="mp-confirm-dialog"
    @touchmove.stop.prevent="() => {}"
    @click.self="confirm.reject()"
  >
    <div
      ref="panel"
      class="mw-mp-dialog mw-frost--thick"
      :class="{ 'mw-mp-dialog--closing': closing }"
      role="alertdialog"
      aria-modal="true"
      :aria-label="displayed.title"
      tabindex="-1"
    >
      <div class="mw-mp-dialog__body">
        <div class="mw-mp-dialog__title">{{ displayed.title }}</div>
        <div v-if="displayed.message" class="mw-mp-dialog__message">
          {{ displayed.message }}
        </div>
      </div>
      <div class="mw-mp-dialog__actions">
        <button
          type="button"
          class="mw-mp-dialog__btn mw-mp-dialog__btn--cancel"
          hover-class="is-pressed"
          data-testid="mp-confirm-cancel"
          @click="confirm.reject()"
        >
          {{ displayed.rejectLabel || "取消" }}
        </button>
        <button
          type="button"
          class="mw-mp-dialog__btn"
          :class="displayed.danger || displayed.acceptSeverity === 'danger'
            ? 'mw-mp-dialog__btn--danger'
            : 'mw-mp-dialog__btn--confirm'"
          hover-class="is-pressed"
          data-testid="mp-confirm-accept"
          @click="confirm.accept()"
        >
          {{ displayed.acceptLabel || "确认" }}
        </button>
      </div>
    </div>
  </div>
</template>
