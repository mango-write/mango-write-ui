<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useMpNotify, type MpNotifyService } from "../lib/mp-notify.js";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpToastHost",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpToastHostProps {
  contained?: boolean;
  offsetBottom?: string;
  closeLabel?: string;
  service?: MpNotifyService;
}

const props = withDefaults(defineProps<MpToastHostProps>(), {
  contained: false,
  offsetBottom: "calc(var(--mp-tabbar-h) + var(--mp-float-inset) * 2 + var(--mw-mp-safe-bottom))",
  closeLabel: "关闭通知",
  service: undefined,
});
const notify = props.service ?? useMpNotify();
const latest = computed(() => notify.items.value[notify.items.value.length - 1]);
const displayed = ref<(typeof notify.items.value)[number] | undefined>(latest.value);
const closing = ref(false);
let exitTimer: ReturnType<typeof setTimeout> | undefined;

function clearExitTimer(): void {
  if (exitTimer !== undefined) {
    clearTimeout(exitTimer);
    exitTimer = undefined;
  }
}

watch(
  latest,
  (next) => {
    clearExitTimer();
    if (next) {
      closing.value = false;
      displayed.value = next;
      return;
    }
    if (!displayed.value) return;
    const reduced =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    if (reduced) {
      closing.value = false;
      displayed.value = undefined;
      return;
    }
    closing.value = true;
    exitTimer = setTimeout(() => {
      exitTimer = undefined;
      closing.value = false;
      displayed.value = undefined;
    }, 110);
  },
  { immediate: true },
);

onBeforeUnmount(clearExitTimer);

const hostStyle = computed(() => ({ bottom: props.offsetBottom }));
const icon = computed<MpIconName>(() => {
  if (displayed.value?.severity === "success") return "success";
  if (displayed.value?.severity === "warn") return "warning";
  if (displayed.value?.severity === "error") return "error";
  return "info";
});
</script>

<template>
  <div
    v-if="displayed"
    class="mw-mp-toast-host"
    :class="{ 'mw-mp-toast-host--contained': contained }"
    :style="hostStyle"
    :role="displayed.severity === 'error' ? 'alert' : 'status'"
    :aria-live="displayed.severity === 'error' ? 'assertive' : 'polite'"
    data-testid="mp-toast-host"
  >
    <div
      :key="displayed.id"
      class="mw-mp-toast mw-frost"
      :class="[`mw-mp-toast--${displayed.severity}`, { 'mw-mp-toast--closing': closing }]"
      data-testid="mp-toast-item"
    >
      <span class="mw-mp-toast__icon"><MpIcon :name="icon" :size="20" /></span>
      <span class="mw-mp-toast__text">
        <strong>{{ displayed.summary }}</strong>
        <span v-if="displayed.detail" class="mw-mp-toast__detail">{{ displayed.detail }}</span>
      </span>
      <button type="button" class="mw-mp-toast__close" :aria-label="closeLabel" @click="notify.clear()">
        <MpIcon name="close" :size="18" />
      </button>
    </div>
  </div>
</template>
