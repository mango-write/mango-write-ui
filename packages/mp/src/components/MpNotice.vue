<script setup lang="ts">
import { computed, useAttrs } from "vue";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpNotice",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export type MpNoticeTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export interface MpNoticeProps {
  title?: string;
  tone?: MpNoticeTone;
  icon?: MpIconName;
}

const props = withDefaults(defineProps<MpNoticeProps>(), {
  title: undefined,
  tone: "neutral",
  icon: undefined,
});
const resolvedIcon = computed<MpIconName>(() => {
  if (props.icon) return props.icon;
  if (props.tone === "success") return "success";
  if (props.tone === "warning") return "warning";
  if (props.tone === "danger") return "error";
  return "info";
});
</script>

<template>
  <div :data-testid="attrs['data-testid']" class="mw-mp-notice" :class="`mw-mp-notice--${tone}`">
    <MpIcon :name="resolvedIcon" :size="22" />
    <div class="mw-mp-notice__body">
      <strong v-if="title" class="mw-mp-notice__title">{{ title }}</strong>
      <div class="mw-mp-notice__content"><slot /></div>
    </div>
  </div>
</template>
