<script setup lang="ts">
import { computed, useAttrs } from "vue";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpNotice",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export type MpNoticeSeverity =
  | "secondary"
  | "primary"
  | "info"
  | "success"
  | "warn"
  | "warning"
  | "error"
  | "danger"
  | "contrast";
/** @deprecated 使用与桌面端对齐的 `MpNoticeSeverity`（`severity` 属性） */
export type MpNoticeTone = MpNoticeSeverity | "neutral";

export interface MpNoticeProps {
  title?: string;
  severity?: MpNoticeSeverity;
  /** @deprecated 使用与桌面端对齐的 `severity` */
  tone?: MpNoticeTone;
  icon?: MpIconName;
}

const props = withDefaults(defineProps<MpNoticeProps>(), {
  title: undefined,
  severity: undefined,
  tone: undefined,
  icon: undefined,
});

const resolvedSeverity = computed(() => {
  const raw = props.severity ?? props.tone ?? "secondary";
  if (raw === "warn") return "warning";
  if (raw === "error") return "danger";
  if (raw === "neutral") return "secondary";
  return raw;
});

const resolvedIcon = computed<MpIconName>(() => {
  if (props.icon) return props.icon;
  if (resolvedSeverity.value === "success") return "success";
  if (resolvedSeverity.value === "warning") return "warning";
  if (resolvedSeverity.value === "danger") return "error";
  return "info";
});
</script>

<template>
  <div
    :data-testid="attrs['data-testid']"
    :data-severity="resolvedSeverity"
    class="mw-mp-notice"
    :class="`mw-mp-notice--${resolvedSeverity}`"
  >
    <MpIcon :name="resolvedIcon" :size="22" />
    <div class="mw-mp-notice__body">
      <strong v-if="title" class="mw-mp-notice__title">{{ title }}</strong>
      <div class="mw-mp-notice__content"><slot /></div>
    </div>
  </div>
</template>
