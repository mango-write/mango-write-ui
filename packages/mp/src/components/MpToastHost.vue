<script setup lang="ts">
import { computed } from "vue";
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
  offsetBottom: "calc(var(--mp-tabbar-h) + var(--mw-mp-safe-bottom) + var(--space-4))",
  closeLabel: "关闭通知",
  service: undefined,
});
const notify = props.service ?? useMpNotify();
const latest = computed(() => notify.items.value[notify.items.value.length - 1]);
const hostStyle = computed(() => ({ bottom: props.offsetBottom }));
const icon = computed<MpIconName>(() => {
  if (latest.value?.severity === "success") return "success";
  if (latest.value?.severity === "warn") return "warning";
  if (latest.value?.severity === "error") return "error";
  return "info";
});
</script>

<template>
  <div
    v-if="latest"
     class="mw-mp-toast-host"
    :class="{ 'mw-mp-toast-host--contained': contained }"
    :style="hostStyle"
    :role="latest.severity === 'error' ? 'alert' : 'status'"
    :aria-live="latest.severity === 'error' ? 'assertive' : 'polite'"
    data-testid="mp-toast-host"
  >
    <div :key="latest.id" class="mw-mp-toast mw-frost" :class="`mw-mp-toast--${latest.severity}`" data-testid="mp-toast-item">
      <MpIcon :name="icon" :size="20" class="mw-mp-toast__icon" />
      <span class="mw-mp-toast__text">
        <strong>{{ latest.summary }}</strong>
        <span v-if="latest.detail" class="mw-mp-toast__detail">{{ latest.detail }}</span>
      </span>
      <button type="button" class="mw-mp-toast__close" :aria-label="closeLabel" @click="notify.clear()">
        <MpIcon name="close" :size="18" />
      </button>
    </div>
  </div>
</template>
